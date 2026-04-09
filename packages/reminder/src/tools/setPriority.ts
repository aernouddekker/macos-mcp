import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";
import { findReminderById } from "../helpers/findById.js";

// Reminders.app priority is an integer enum: 0=none, 1=high, 5=medium, 9=low.
export type PriorityLevel = "none" | "high" | "medium" | "low";

const PRIORITY_MAP: Record<PriorityLevel, number> = {
  none: 0,
  high: 1,
  medium: 5,
  low: 9,
};

export async function setPriority(id: string, priority: PriorityLevel) {
  const i = escapeForAppleScript(id);
  const value = PRIORITY_MAP[priority];

  const script = `
tell application "Reminders"
  ${findReminderById(i)}
  set priority of foundReminder to ${value}
  return "ok"
end tell`;

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") return null;
  return { id, priority, priorityValue: value };
}
