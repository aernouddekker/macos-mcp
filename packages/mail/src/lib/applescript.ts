import { execFileSync } from "node:child_process";
import { runAppleScript, runJXA, jsLiteral, escapeForAppleScript } from "./applescript-core.js";

export * from "./applescript-core.js";

/** Prefer the local `id` from search results: RFC IDs require loading every header. */
export function messageIdFilter(messageId: string): string {
  if (/^\d+$/.test(messageId)) {
    const id = Number(messageId);
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("Mail message ID must be a positive safe integer");
    }
    return `id is ${id}`;
  }
  return `message id is "${escapeForAppleScript(messageId)}"`;
}

/**
 * Put an HTML string on the general pasteboard with the `public.html` flavor so
 * a subsequent Cmd-V pastes rendered rich text (not raw tags) into an app that
 * accepts rich content — e.g. Mail's reply editor, which exposes no scriptable
 * way to set an HTML body on a reply. Pair with getClipboardText/setClipboardText
 * to save and restore the user's prior clipboard around the paste.
 */
export async function setHtmlClipboard(html: string): Promise<void> {
  await runJXA(`
ObjC.import("AppKit");
var pb = $.NSPasteboard.generalPasteboard;
pb.clearContents;
pb.setStringForType($(${jsLiteral(html)}), $.NSPasteboardTypeHTML);
"ok";`);
}

/** Read the plain-text clipboard contents, or "" if it holds no text. */
export async function getClipboardText(): Promise<string> {
  try {
    return await runAppleScript("the clipboard as text");
  } catch {
    return "";
  }
}

/** Replace the clipboard with plain text. Robust to newlines/quotes via JXA. */
export async function setClipboardText(text: string): Promise<void> {
  await runJXA(`
ObjC.import("AppKit");
var pb = $.NSPasteboard.generalPasteboard;
pb.clearContents;
pb.setStringForType($(${jsLiteral(text)}), $.NSPasteboardTypeString);
"ok";`);
}

// Leave-as-found tracking: remember which apps we launched (vs. were
// already running). Apps we launched are quit after each tool call by
// default (the AppleScript wrapper handles per-call quit); apps marked
// keepOpen — drafts, focus/show tools — stay open until server shutdown,
// at which point the exit handlers below quit them. The probe runs on
// every withLaunch() call because the user can manually quit the app
// between calls, in which case the next call relaunches it and we need
// to mark it as ours-to-quit again.
const launchedByUs = new Set<string>();
let exitHandlersInstalled = false;
let shutdownComplete = false;

function isAppRunning(app: string): boolean {
  try {
    execFileSync("pgrep", ["-x", app], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function quitLaunchedApps(): void {
  // Idempotent across signal + "exit" paths: SIGTERM handlers call this
  // and then process.exit(0), which itself fires "exit". Without the gate
  // we'd send `quit` twice per app, and the second pass would relaunch
  // any app that finished quitting between passes just to send quit again.
  if (shutdownComplete) return;
  shutdownComplete = true;
  for (const app of launchedByUs) {
    // Skip apps the user already quit manually — `tell ... to quit` would
    // relaunch them solely to deliver the verb (visible Dock bounce, no value).
    if (!isAppRunning(app)) continue;
    try {
      execFileSync("osascript", ["-e", `tell application "${app}" to quit`], {
        timeout: 10000,
        stdio: "ignore",
      });
    } catch {
      // App may have crashed or be unresponsive — ignore.
    }
  }
}

function installExitHandlers(): void {
  if (exitHandlersInstalled) return;
  exitHandlersInstalled = true;
  const onSignal = () => {
    quitLaunchedApps();
    process.exit(0);
  };
  process.on("SIGTERM", onSignal);
  process.on("SIGINT", onSignal);
  process.on("SIGHUP", onSignal);
  // Covers natural exit when the MCP host closes stdio without signaling.
  // Re-entry is guarded by shutdownComplete.
  process.on("exit", quitLaunchedApps);
}

export interface WithLaunchOptions {
  /**
   * When true and we launched the app for this call, leave it open after
   * the tool body runs. Use for tools that surface UI state the user is
   * meant to see (drafts, focused items). Defaults to false — apps we
   * launched are quit at the end of the call.
   */
  keepOpen?: boolean;
}

export function withLaunch(
  app: string,
  body: string,
  opts: WithLaunchOptions = {},
): string {
  installExitHandlers();
  const wasRunning = isAppRunning(app);
  if (!wasRunning) {
    launchedByUs.add(app);
  }

  const launchAndWait = `do shell script "open -g -a ${app}"
repeat 50 times
  try
    tell application "${app}" to get name
    exit repeat
  on error
    delay 0.1
  end try
end repeat`;

  // If the app was already open, leave it alone — the user owns its
  // lifecycle. If the caller opted into keepOpen, the shutdown safety
  // net (quitLaunchedApps) takes care of it instead.
  const shouldQuitAfter = !wasRunning && !opts.keepOpen;
  if (!shouldQuitAfter) {
    return `${launchAndWait}
${body}`;
  }

  // Per-call quit: wrap the body in a script object so its `return` value
  // can be captured. Top-level `return` would exit the whole script before
  // the quit clause runs, which would defeat the cleanup. Errors propagate
  // after the quit so we never strand the app open on failure paths.
  //
  // AppleScript disallows nested handler defs, so any `on X(...) ... end X`
  // blocks in the body must be hoisted to the outer script scope. Bodies
  // already call them as `my X(...)`, which resolves to the enclosing
  // script's handler — both forms work whether the handler is inline or
  // hoisted.
  const { hoisted, rest } = hoistHandlers(body);
  return `${hoisted}
script __bodyRunner
  on run
${rest}
  end run
end script

${launchAndWait}

set __result to missing value
set __err to missing value
try
  set __result to run __bodyRunner
on error errMsg
  set __err to errMsg
end try

try
  tell application "${app}" to quit
end try

if __err is not missing value then error __err
return __result`;
}

function hoistHandlers(body: string): { hoisted: string; rest: string } {
  // Matches `on name(...)` ... `end name` at the start of a line, with the
  // closing `end` keyword followed by the same name. Our codebase always
  // uses the named-end form (e.g. `end __makeDate`), so the backreference
  // gives an unambiguous block boundary even when the body contains other
  // `end` tokens (end tell, end repeat, end try).
  const regex = /^[ \t]*on[ \t]+(\w+)[ \t]*\([^)]*\)[\s\S]*?^[ \t]*end[ \t]+\1[ \t]*$/gm;
  let hoisted = "";
  const rest = body.replace(regex, (match) => {
    hoisted += match + "\n";
    return "";
  });
  return { hoisted, rest };
}

/**
 * Async equivalent of withLaunch() for non-AppleScript bodies (JXA, multi-step
 * TS work). Launches the app if needed, runs the callback, then quits the app
 * if we launched it and keepOpen wasn't requested. Mirrors withLaunch's
 * ownership semantics so the shutdown safety net still works as a backstop.
 */
export async function runWithApp<T>(
  app: string,
  fn: () => Promise<T>,
  opts: WithLaunchOptions = {},
): Promise<T> {
  installExitHandlers();
  const wasRunning = isAppRunning(app);
  const shouldQuitAfter = !wasRunning && !opts.keepOpen;
  if (!wasRunning) {
    launchedByUs.add(app);
  }
  if (!wasRunning) {
    await runAppleScript(`do shell script "open -g -a ${app}"
repeat 50 times
  try
    tell application "${app}" to get name
    exit repeat
  on error
    delay 0.1
  end try
end repeat`);
  }
  try {
    return await fn();
  } finally {
    if (shouldQuitAfter && isAppRunning(app)) {
      try {
        execFileSync("osascript", ["-e", `tell application "${app}" to quit`], {
          timeout: 10000,
          stdio: "ignore",
        });
      } catch {
        // Same swallow as quitLaunchedApps — shutdown handler is the backstop.
      }
    }
  }
}
