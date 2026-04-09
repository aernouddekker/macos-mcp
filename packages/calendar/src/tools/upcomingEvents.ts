import { runAppleScript, escapeForAppleScript, parseRecords, FIELD_SEP, RECORD_SEP } from "../lib/applescript.js";

export async function upcomingEvents(days: number = 7, calendarName?: string, limit: number = 100) {
  const cName = calendarName ? escapeForAppleScript(calendarName) : "";

  const targetBlock = calendarName
    ? `set results to (every calendar whose name is "${cName}")
  if (count of results) = 0 then
    return "NOT_FOUND"
  end if
  set targetCals to results`
    : `set targetCals to every calendar`;

  const script = `
tell application "Calendar"
  set startD to current date
  set endD to startD + (${days} * days)

  ${targetBlock}

  set output to ""
  set maxCount to ${limit}
  set i to 0
  repeat with c in targetCals
    if i >= maxCount then exit repeat
    set cName to name of c as string
    try
      set matched to (every event of c whose start date is greater than or equal to startD and start date is less than or equal to endD)
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
        set output to output & eUid & "${FIELD_SEP}" & eSummary & "${FIELD_SEP}" & cName & "${FIELD_SEP}" & eStart & "${FIELD_SEP}" & eEnd & "${FIELD_SEP}" & eAllDay & "${RECORD_SEP}"
        set i to i + 1
      end repeat
    end try
  end repeat
  return output
end tell`;

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") return null;
  const records = parseRecords(raw, ["uid", "summary", "calendar", "start", "end", "allDay"]);
  return records.map((r) => ({ ...r, allDay: r.allDay === "true" }));
}
