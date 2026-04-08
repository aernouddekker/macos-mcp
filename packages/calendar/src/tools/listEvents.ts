import { runAppleScript, escapeForAppleScript, parseRecords, FIELD_SEP, RECORD_SEP } from "@mailappmcp/shared";
import { appleScriptDateHelper, isoToAppleScriptDate } from "../helpers/dates.js";

export async function listEvents(
  calendarName: string,
  startDate: string,
  endDate: string,
  limit: number = 100,
) {
  const cName = escapeForAppleScript(calendarName);
  const startExpr = isoToAppleScriptDate(startDate);
  const endExpr = isoToAppleScriptDate(endDate);

  const script = `
${appleScriptDateHelper()}
tell application "Calendar"
  set results to (every calendar whose name is "${cName}")
  if (count of results) = 0 then
    return "NOT_FOUND"
  end if
  set c to item 1 of results
  set startD to ${startExpr}
  set endD to ${endExpr}
  set matched to (every event of c whose start date is greater than or equal to startD and start date is less than or equal to endD)
  set output to ""
  set maxCount to ${limit}
  set i to 0
  repeat with e in matched
    if i >= maxCount then exit repeat
    set eUid to ""
    try
      set eUid to uid of e as string
    end try
    set eSummary to ""
    try
      set eSummary to summary of e as string
      if eSummary is "missing value" then set eSummary to ""
    end try
    set eStart to ""
    try
      set eStart to (start date of e) as string
    end try
    set eEnd to ""
    try
      set eEnd to (end date of e) as string
    end try
    set eAllDay to "false"
    try
      set eAllDay to (allday event of e) as string
    end try
    set eLoc to ""
    try
      set eLoc to location of e as string
      if eLoc is "missing value" then set eLoc to ""
    end try
    set output to output & eUid & "${FIELD_SEP}" & eSummary & "${FIELD_SEP}" & eStart & "${FIELD_SEP}" & eEnd & "${FIELD_SEP}" & eAllDay & "${FIELD_SEP}" & eLoc & "${RECORD_SEP}"
    set i to i + 1
  end repeat
  return output
end tell`;

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") return null;
  const records = parseRecords(raw, ["uid", "summary", "start", "end", "allDay", "location"]);
  return records.map((r) => ({ ...r, allDay: r.allDay === "true" }));
}
