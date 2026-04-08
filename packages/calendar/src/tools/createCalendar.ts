import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";

// Note: Calendar.app calendars have no AppleScript-accessible id, so we
// don't try to read it back. The calendar is identified by name everywhere.
export async function createCalendar(name: string, description?: string) {
  const n = escapeForAppleScript(name);
  const descBlock = description !== undefined
    ? `, description:"${escapeForAppleScript(description)}"`
    : "";
  const script = `
tell application "Calendar"
  make new calendar with properties {name:"${n}"${descBlock}}
  return "ok"
end tell`;

  await runAppleScript(script);
  return { name, description, created: true };
}
