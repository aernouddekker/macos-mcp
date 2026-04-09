import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";
import { findReminderById } from "../helpers/findById.js";

export async function moveReminder(id: string, targetList: string) {
  const i = escapeForAppleScript(id);
  const t = escapeForAppleScript(targetList);

  const script = `
tell application "Reminders"
  set targetResults to (every list whose name is "${t}")
  if (count of targetResults) = 0 then
    return "TARGET_NOT_FOUND"
  end if
  set targetL to item 1 of targetResults

  ${findReminderById(i)}

  move foundReminder to targetL
  return "ok"
end tell`;

  const raw = await runAppleScript(script);
  const trimmed = raw.trim();
  if (trimmed === "NOT_FOUND" || trimmed === "TARGET_NOT_FOUND") return null;
  return { id, targetList, moved: true };
}
