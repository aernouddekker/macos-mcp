import { execFileSync } from "node:child_process";

export * from "./applescript-core.js";

// Leave-as-found tracking: remember which apps we launched (vs. were
// already running), and quit only those on server shutdown. The probe
// runs on every withLaunch() call — pgrep is cheap, and the check has
// to repeat because the user can manually quit the app between calls,
// in which case the next call relaunches it and we need to mark it as
// ours-to-quit.
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

export function withLaunch(app: string, body: string): string {
  installExitHandlers();
  if (!isAppRunning(app)) {
    launchedByUs.add(app);
  }
  return `do shell script "open -g -a ${app}"
repeat 50 times
  try
    tell application "${app}" to get name
    exit repeat
  on error
    delay 0.1
  end try
end repeat
${body}`;
}
