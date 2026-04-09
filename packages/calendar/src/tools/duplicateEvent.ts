import { runAppleScript, escapeForAppleScript, withLaunch } from "../lib/applescript.js";

export async function duplicateEvent(uid: string, targetCalendar?: string) {
  const u = escapeForAppleScript(uid);
  const t = targetCalendar ? escapeForAppleScript(targetCalendar) : "";

  const targetBlock = targetCalendar
    ? `set targetResults to (every calendar whose name is "${t}")
  if (count of targetResults) = 0 then
    return "TARGET_NOT_FOUND"
  end if
  set targetCal to item 1 of targetResults`
    : `set targetCal to sourceCal`;

  const script = withLaunch("Calendar", `
tell application "Calendar"
  set foundEvent to missing value
  set sourceCal to missing value
  repeat with c in every calendar
    try
      set results to (every event of c whose uid is "${u}")
      if (count of results) > 0 then
        set foundEvent to item 1 of results
        set sourceCal to c
        exit repeat
      end if
    end try
  end repeat
  if foundEvent is missing value then
    return "NOT_FOUND"
  end if

  ${targetBlock}

  set eSummary to ""
  try
    set eSummary to summary of foundEvent as string
    if eSummary is "missing value" then set eSummary to ""
  end try
  set eStart to start date of foundEvent
  set eEnd to end date of foundEvent
  set eAllDay to false
  try
    set eAllDay to allday event of foundEvent
  end try
  set eLoc to ""
  try
    set eLoc to location of foundEvent as string
    if eLoc is "missing value" then set eLoc to ""
  end try
  set eDesc to ""
  try
    set eDesc to description of foundEvent as string
    if eDesc is "missing value" then set eDesc to ""
  end try
  set eUrl to ""
  try
    set eUrl to url of foundEvent as string
    if eUrl is "missing value" then set eUrl to ""
  end try

  tell targetCal
    set newEvent to make new event with properties {summary:eSummary, start date:eStart, end date:eEnd, allday event:eAllDay, location:eLoc, description:eDesc, url:eUrl}
  end tell

  return uid of newEvent
end tell`);

  const result = await runAppleScript(script);
  const trimmed = result.trim();
  if (trimmed === "NOT_FOUND" || trimmed === "TARGET_NOT_FOUND") return null;
  return { sourceUid: uid, newUid: trimmed, targetCalendar: targetCalendar ?? null };
}
