import { execFileSync } from "node:child_process";

export * from "./applescript-core.js";

// Leave-as-found tracking: remember which apps we launched (vs. were
// already running), and quit only those on server shutdown. State is
// per-server-process, checked lazily on the first withLaunch() call
// for each app so the probe cost is paid once per session.
const touchedApps = new Set<string>();
const launchedByUs = new Set<string>();
let exitHandlersInstalled = false;

function isAppRunning(app: string): boolean {
  try {
    execFileSync("pgrep", ["-x", app], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function quitLaunchedApps(): void {
  for (const app of launchedByUs) {
    try {
      execFileSync("osascript", ["-e", `tell application "${app}" to quit`], {
        timeout: 5000,
        stdio: "ignore",
      });
    } catch {
      // App may have been quit manually, crashed, or be unresponsive — ignore.
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
  process.on("exit", quitLaunchedApps);
}

export function withLaunch(app: string, body: string): string {
  if (!touchedApps.has(app)) {
    touchedApps.add(app);
    if (!isAppRunning(app)) {
      launchedByUs.add(app);
    }
    installExitHandlers();
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
