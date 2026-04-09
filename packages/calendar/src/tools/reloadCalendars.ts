import { runAppleScript } from "../lib/applescript.js";

export async function reloadCalendars() {
  const script = `
tell application "Calendar"
  reload calendars
  return "ok"
end tell`;

  await runAppleScript(script);
  return { reloaded: true };
}
