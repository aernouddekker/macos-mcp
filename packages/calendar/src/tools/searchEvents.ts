import { runAppleScript, escapeForAppleScript, parseRecords, FIELD_SEP, RECORD_SEP } from "../lib/applescript.js";
import { appleScriptDateHelper, isoToAppleScriptDate } from "../helpers/dates.js";

// Search events by summary substring. Always bounded by a date window —
// without one, AppleScript iterates the entire calendar history and easily
// blows past the 30s osascript timeout on large stores.
//
// Defaults: previous 30 days through next 365 days.
export async function searchEvents(
  query: string,
  calendarName?: string,
  limit: number = 25,
  since?: string,
  until?: string,
) {
  const q = escapeForAppleScript(query);
  const cName = calendarName ? escapeForAppleScript(calendarName) : "";

  const now = Date.now();
  const sinceIso = since ?? new Date(now - 30 * 24 * 3600 * 1000).toISOString();
  const untilIso = until ?? new Date(now + 365 * 24 * 3600 * 1000).toISOString();
  const startExpr = isoToAppleScriptDate(sinceIso);
  const endExpr = isoToAppleScriptDate(untilIso);

  const calLoop = calendarName
    ? `set found to (every calendar whose name is "${cName}")
  if (count of found) = 0 then
    return "NOT_FOUND"
  end if
  set targetCals to found`
    : `set targetCals to every calendar`;

  // Batched per-calendar: pull uid/summary/start/end as parallel lists in
  // O(properties) AppleScript calls instead of O(events).
  const script = `
${appleScriptDateHelper()}
tell application "Calendar"
  ${calLoop}
  set startD to ${startExpr}
  set endD to ${endExpr}
  set output to ""
  set total to 0
  set maxCount to ${limit}
  repeat with c in targetCals
    if total >= maxCount then exit repeat
    set cName to ""
    try
      set cName to name of c as string
    end try
    try
      set matched to (every event of c whose summary contains "${q}" and start date is greater than or equal to startD and start date is less than or equal to endD)
      set n to count of matched
      if n > 0 then
        set uids to uid of matched
        set summaries to summary of matched
        set starts to start date of matched
        set ends to end date of matched
        repeat with k from 1 to n
          if total >= maxCount then exit repeat
          set u to ""
          try
            set u to (item k of uids) as string
          end try
          set s to ""
          try
            set s to (item k of summaries) as string
            if s is "missing value" then set s to ""
          end try
          set sd to ""
          try
            set sd to (item k of starts) as string
          end try
          set ed to ""
          try
            set ed to (item k of ends) as string
          end try
          set output to output & u & "${FIELD_SEP}" & s & "${FIELD_SEP}" & cName & "${FIELD_SEP}" & sd & "${FIELD_SEP}" & ed & "${RECORD_SEP}"
          set total to total + 1
        end repeat
      end if
    end try
  end repeat
  return output
end tell`;

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") return null;
  return parseRecords(raw, ["uid", "summary", "calendar", "start", "end"]);
}
