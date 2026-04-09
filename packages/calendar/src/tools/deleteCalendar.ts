import { runAppleScript, escapeForAppleScript } from "../lib/applescript.js";

// IMPORTANT: Calendar.app does NOT support deleting calendars via AppleScript.
// `delete calendar` raises -10000 (AppleEvent handler failed) on every macOS
// version we've tested. This tool exists for API completeness, but it always
// throws a descriptive error. Users must remove calendars from the Calendar.app
// UI (right-click → Delete) or via the CalDAV server.
export async function deleteCalendar(name: string) {
  const n = escapeForAppleScript(name);
  // Verify the calendar actually exists so we return NOT_FOUND for the
  // unknown-name case rather than the unsupported-operation message.
  const checkScript = `
tell application "Calendar"
  return (count of (every calendar whose name is "${n}")) as string
end tell`;
  const count = parseInt((await runAppleScript(checkScript)).trim(), 10) || 0;
  if (count === 0) return null;

  throw new Error(
    `Calendar.app does not support deleting calendars via AppleScript ` +
      `(returns -10000). Remove the calendar "${name}" from the Calendar.app ` +
      `UI instead (right-click the calendar in the sidebar → Delete).`,
  );
}
