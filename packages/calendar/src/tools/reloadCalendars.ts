import { runAppleScript, withLaunch } from "../lib/applescript.js";

export async function reloadCalendars() {
  const script = withLaunch("Calendar", `
tell application "Calendar"
  reload calendars
  return "ok"
end tell`);

  await runAppleScript(script);
  return { reloaded: true };
}
