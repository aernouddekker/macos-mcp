import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";
import { findReminderById } from "../helpers/findById.js";

export async function showReminder(id: string) {
  const i = escapeForAppleScript(id);
  const script = `
tell application "Reminders"
  ${findReminderById(i)}
  show foundReminder
  activate
  return "ok"
end tell`;

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") return null;
  return { id, shown: true };
}
