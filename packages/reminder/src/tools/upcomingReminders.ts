import { runAppleScript, escapeForAppleScript, parseRecords } from "../lib/applescript.js";
import { appendReminderRecord, REMINDER_RECORD_FIELDS, coerceReminderRecord } from "../helpers/reminderFields.js";

export async function upcomingReminders(
  days: number = 7,
  listName?: string,
  includeCompleted: boolean = false,
  limit: number = 100,
) {
  const filterCompleted = includeCompleted ? "" : " and completed is false";

  const targetBlock = listName
    ? `set found to (every list whose name is "${escapeForAppleScript(listName)}")
  if (count of found) = 0 then
    return "NOT_FOUND"
  end if
  set targetLists to found`
    : `set targetLists to every list`;

  const script = `
tell application "Reminders"
  set startD to current date
  set endD to startD + (${days} * days)

  ${targetBlock}

  set output to ""
  set total to 0
  set maxCount to ${limit}
  repeat with l in targetLists
    if total >= maxCount then exit repeat
    set lName to ""
    try
      set lName to name of l as string
    end try
    try
      set matched to (every reminder of l whose due date is greater than or equal to startD and due date is less than or equal to endD${filterCompleted})
      repeat with r in matched
        if total >= maxCount then exit repeat
        ${appendReminderRecord("lName")}
        set total to total + 1
      end repeat
    end try
  end repeat
  return output
end tell`;

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") return null;
  return parseRecords(raw, [...REMINDER_RECORD_FIELDS]).map(coerceReminderRecord);
}
