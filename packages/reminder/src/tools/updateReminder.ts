import { runAppleScript, escapeForAppleScript, withLaunch } from "../lib/applescript.js";
import { appleScriptDateHelper, isoToAppleScriptDate } from "../helpers/dates.js";

export interface UpdateReminderFields {
  name?: string;
  body?: string;
  dueDate?: string;
  allDayDueDate?: string;
  remindMeDate?: string;
  priority?: number;
  flagged?: boolean;
}

export async function updateReminder(id: string, fields: UpdateReminderFields) {
  const i = escapeForAppleScript(id);

  const setLines: string[] = [];
  if (fields.name !== undefined) {
    setLines.push(`set name of r to "${escapeForAppleScript(fields.name)}"`);
  }
  if (fields.body !== undefined) {
    setLines.push(`set body of r to "${escapeForAppleScript(fields.body)}"`);
  }
  if (fields.dueDate !== undefined) {
    setLines.push(`set due date of r to ${isoToAppleScriptDate(fields.dueDate)}`);
  }
  if (fields.allDayDueDate !== undefined) {
    setLines.push(`set allday due date of r to ${isoToAppleScriptDate(fields.allDayDueDate)}`);
  }
  if (fields.remindMeDate !== undefined) {
    setLines.push(`set remind me date of r to ${isoToAppleScriptDate(fields.remindMeDate)}`);
  }
  if (fields.priority !== undefined) {
    setLines.push(`set priority of r to ${fields.priority}`);
  }
  if (fields.flagged !== undefined) {
    setLines.push(`set flagged of r to ${fields.flagged}`);
  }

  const script = withLaunch("Reminders", `
${appleScriptDateHelper()}
tell application "Reminders"
  set foundReminder to missing value
  repeat with l in every list
    try
      set results to (every reminder of l whose id is "${i}")
      if (count of results) > 0 then
        set foundReminder to item 1 of results
        exit repeat
      end if
    end try
  end repeat
  if foundReminder is missing value then
    return "NOT_FOUND"
  end if
  set r to foundReminder
  ${setLines.join("\n  ")}
  return "ok"
end tell`);

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") return null;
  return { id, updated: fields };
}
