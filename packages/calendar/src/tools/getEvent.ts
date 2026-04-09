import { runAppleScript, escapeForAppleScript, withLaunch, FIELD_SEP } from "../lib/applescript.js";

export async function getEvent(uid: string) {
  const u = escapeForAppleScript(uid);
  const script = withLaunch("Calendar", `
tell application "Calendar"
  set foundEvent to missing value
  set foundCal to ""
  repeat with c in every calendar
    try
      set results to (every event of c whose uid is "${u}")
      if (count of results) > 0 then
        set foundEvent to item 1 of results
        set foundCal to name of c as string
        exit repeat
      end if
    end try
  end repeat
  if foundEvent is missing value then
    return "NOT_FOUND"
  end if
  set e to foundEvent
  set eSummary to ""
  try
    set eSummary to summary of e as string
    if eSummary is "missing value" then set eSummary to ""
  end try
  set eLoc to ""
  try
    set eLoc to location of e as string
    if eLoc is "missing value" then set eLoc to ""
  end try
  set eDesc to ""
  try
    set eDesc to description of e as string
    if eDesc is "missing value" then set eDesc to ""
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
  set eStatus to ""
  try
    set eStatus to (status of e) as string
  end try
  set eUrl to ""
  try
    set eUrl to url of e as string
    if eUrl is "missing value" then set eUrl to ""
  end try
  set eRec to ""
  try
    set eRec to recurrence of e as string
    if eRec is "missing value" then set eRec to ""
  end try
  set eStamp to ""
  try
    set eStamp to (stamp date of e) as string
  end try
  set eSeq to "0"
  try
    set eSeq to (sequence of e) as string
  end try
  return "${u}" & "${FIELD_SEP}" & foundCal & "${FIELD_SEP}" & eSummary & "${FIELD_SEP}" & eLoc & "${FIELD_SEP}" & eDesc & "${FIELD_SEP}" & eStart & "${FIELD_SEP}" & eEnd & "${FIELD_SEP}" & eAllDay & "${FIELD_SEP}" & eStatus & "${FIELD_SEP}" & eUrl & "${FIELD_SEP}" & eRec & "${FIELD_SEP}" & eStamp & "${FIELD_SEP}" & eSeq
end tell`);

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") return null;
  const parts = raw.split(FIELD_SEP);
  return {
    uid: (parts[0] ?? "").trim(),
    calendar: (parts[1] ?? "").trim(),
    summary: (parts[2] ?? "").trim(),
    location: (parts[3] ?? "").trim(),
    description: (parts[4] ?? "").trim(),
    startDate: (parts[5] ?? "").trim(),
    endDate: (parts[6] ?? "").trim(),
    allDay: (parts[7] ?? "").trim() === "true",
    status: (parts[8] ?? "").trim(),
    url: (parts[9] ?? "").trim(),
    recurrence: (parts[10] ?? "").trim(),
    stampDate: (parts[11] ?? "").trim(),
    sequence: parseInt((parts[12] ?? "0").trim(), 10) || 0,
  };
}
