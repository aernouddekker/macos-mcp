import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";

export async function addSoundAlarm(uid: string, minutesBefore: number, soundName: string) {
  const u = escapeForAppleScript(uid);
  const sn = escapeForAppleScript(soundName);
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
    make new sound alarm with properties {trigger interval:${-Math.abs(minutesBefore)}, sound name:"${sn}"}
  end tell
  return "ok"
end tell`;

  const result = await runAppleScript(script);
  if (result.trim() === "NOT_FOUND") return null;
  return { uid, type: "sound", minutesBefore, soundName };
}
