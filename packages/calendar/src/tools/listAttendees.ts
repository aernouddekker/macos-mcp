import { runAppleScript, escapeForAppleScript, parseRecords, FIELD_SEP, RECORD_SEP } from "@mailappmcp/shared";

export async function listAttendees(uid: string) {
  const u = escapeForAppleScript(uid);
  const script = `
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
  set output to ""
  try
    repeat with a in attendees of foundEvent
      set aEmail to ""
      try
        set aEmail to email of a as string
        if aEmail is "missing value" then set aEmail to ""
      end try
      set aName to ""
      try
        set aName to display name of a as string
        if aName is "missing value" then set aName to ""
      end try
      set aStatus to ""
      try
        set aStatus to (participation status of a) as string
      end try
      set output to output & aEmail & "${FIELD_SEP}" & aName & "${FIELD_SEP}" & aStatus & "${RECORD_SEP}"
    end repeat
  end try
  return output
end tell`;

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") return null;
  return parseRecords(raw, ["email", "displayName", "status"]);
}
