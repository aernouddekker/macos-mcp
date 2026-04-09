import { runAppleScript, escapeForAppleScript } from "../lib/applescript.js";
import { findReminderById } from "../helpers/findById.js";

export async function completeReminder(id: string) {
  const i = escapeForAppleScript(id);
  const script = `
tell application "Reminders"
  ${findReminderById(i)}
  set completed of foundReminder to true
  return "ok"
end tell`;

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") return null;
  return { id, completed: true };
}
