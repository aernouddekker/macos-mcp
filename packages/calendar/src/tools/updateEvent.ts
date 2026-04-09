import { runAppleScript, escapeForAppleScript } from "../lib/applescript.js";
import { appleScriptDateHelper, isoToAppleScriptDate } from "../helpers/dates.js";

export interface UpdateEventFields {
  summary?: string;
  startDate?: string;
  endDate?: string;
  allDay?: boolean;
  location?: string;
  description?: string;
  url?: string;
}

export async function updateEvent(uid: string, fields: UpdateEventFields) {
  const u = escapeForAppleScript(uid);

  const setLines: string[] = [];
  if (fields.summary !== undefined) {
    setLines.push(`set summary of e to "${escapeForAppleScript(fields.summary)}"`);
  }
  if (fields.startDate !== undefined) {
    setLines.push(`set start date of e to ${isoToAppleScriptDate(fields.startDate)}`);
  }
  if (fields.endDate !== undefined) {
    setLines.push(`set end date of e to ${isoToAppleScriptDate(fields.endDate)}`);
  }
  if (fields.allDay !== undefined) {
    setLines.push(`set allday event of e to ${fields.allDay}`);
  }
  if (fields.location !== undefined) {
    setLines.push(`set location of e to "${escapeForAppleScript(fields.location)}"`);
  }
  if (fields.description !== undefined) {
    setLines.push(`set description of e to "${escapeForAppleScript(fields.description)}"`);
  }
  if (fields.url !== undefined) {
    setLines.push(`set url of e to "${escapeForAppleScript(fields.url)}"`);
  }

  const script = `
${appleScriptDateHelper()}
tell application "Calendar"
  set foundEvent to missing value
  repeat with c in every calendar
    try
      set results to (every event of c whose uid is "${u}")
      if (count of results) > 0 then
        set foundEvent to item 1 of results
        exit repeat
      end if
    end try
  end repeat
  if foundEvent is missing value then
    return "NOT_FOUND"
  end if
  set e to foundEvent
  ${setLines.join("\n  ")}
  return "ok"
end tell`;

  const result = await runAppleScript(script);
  if (result.trim() === "NOT_FOUND") return null;
  return { uid, updated: fields };
}
