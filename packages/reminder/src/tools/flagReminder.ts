import { runAppleScript, escapeForAppleScript, withLaunch } from "../lib/applescript.js";
import { findReminderById } from "../helpers/findById.js";

export async function flagReminder(id: string, flagged: boolean) {
  const i = escapeForAppleScript(id);
  const script = withLaunch("Reminders", `
tell application "Reminders"
  ${findReminderById(i)}
  set flagged of foundReminder to ${flagged}
  return "ok"
end tell`);

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") return null;
  return { id, flagged };
}
