import { runAppleScript, escapeForAppleScript, withLaunch } from "../lib/applescript.js";
import { findReminderById } from "../helpers/findById.js";

export async function deleteReminder(id: string) {
  const i = escapeForAppleScript(id);
  const script = withLaunch("Reminders", `
tell application "Reminders"
  ${findReminderById(i)}
  delete foundReminder
  return "ok"
end tell`);

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") return null;
  return { id, deleted: true };
}
