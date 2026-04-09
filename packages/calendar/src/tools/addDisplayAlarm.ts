import { runAppleScript, escapeForAppleScript } from "../lib/applescript.js";

export async function addDisplayAlarm(uid: string, minutesBefore: number) {
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
  tell foundEvent
    make new display alarm with properties {trigger interval:${-Math.abs(minutesBefore)}}
  end tell
  return "ok"
end tell`;

  const result = await runAppleScript(script);
  if (result.trim() === "NOT_FOUND") return null;
  return { uid, type: "display", minutesBefore };
}
