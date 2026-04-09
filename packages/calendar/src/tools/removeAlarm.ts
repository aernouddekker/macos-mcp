import { runAppleScript, escapeForAppleScript, withLaunch } from "../lib/applescript.js";

/**
 * Remove an alarm by its 1-based index within the union of an event's
 * display, mail, and sound alarms (in that order — matching the ordering
 * returned by `list-alarms`).
 */
export async function removeAlarm(uid: string, index: number) {
  const u = escapeForAppleScript(uid);
  const script = withLaunch("Calendar", `
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
  set targetIdx to ${index}
  set cur to 0
  set deleted to false
  try
    repeat with a in display alarms of foundEvent
      set cur to cur + 1
      if cur is targetIdx then
        delete a
        set deleted to true
        exit repeat
      end if
    end repeat
  end try
  if not deleted then
    try
      repeat with a in mail alarms of foundEvent
        set cur to cur + 1
        if cur is targetIdx then
          delete a
          set deleted to true
          exit repeat
        end if
      end repeat
    end try
  end if
  if not deleted then
    try
      repeat with a in sound alarms of foundEvent
        set cur to cur + 1
        if cur is targetIdx then
          delete a
          set deleted to true
          exit repeat
        end if
      end repeat
    end try
  end if
  if deleted then
    return "ok"
  else
    return "ALARM_NOT_FOUND"
  end if
end tell`);

  const result = await runAppleScript(script);
  const trimmed = result.trim();
  if (trimmed === "NOT_FOUND") return null;
  if (trimmed === "ALARM_NOT_FOUND") return { uid, index, removed: false };
  return { uid, index, removed: true };
}
