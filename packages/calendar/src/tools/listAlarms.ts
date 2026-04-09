import { runAppleScript, escapeForAppleScript, parseRecords, FIELD_SEP, RECORD_SEP } from "../lib/applescript.js";

export async function listAlarms(uid: string) {
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
  set idx to 1
  try
    repeat with a in display alarms of foundEvent
      set ti to ""
      try
        set ti to (trigger interval of a) as string
      end try
      set output to output & idx & "${FIELD_SEP}" & "display" & "${FIELD_SEP}" & ti & "${FIELD_SEP}" & "" & "${RECORD_SEP}"
      set idx to idx + 1
    end repeat
  end try
  try
    repeat with a in mail alarms of foundEvent
      set ti to ""
      try
        set ti to (trigger interval of a) as string
      end try
      set output to output & idx & "${FIELD_SEP}" & "mail" & "${FIELD_SEP}" & ti & "${FIELD_SEP}" & "" & "${RECORD_SEP}"
      set idx to idx + 1
    end repeat
  end try
  try
    repeat with a in sound alarms of foundEvent
      set ti to ""
      try
        set ti to (trigger interval of a) as string
      end try
      set sn to ""
      try
        set sn to (sound name of a) as string
        if sn is "missing value" then set sn to ""
      end try
      set output to output & idx & "${FIELD_SEP}" & "sound" & "${FIELD_SEP}" & ti & "${FIELD_SEP}" & sn & "${RECORD_SEP}"
      set idx to idx + 1
    end repeat
  end try
  return output
end tell`;

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") return null;
  const records = parseRecords(raw, ["index", "type", "triggerInterval", "soundName"]);
  return records.map((r) => ({
    index: parseInt(r.index, 10) || 0,
    type: r.type,
    triggerInterval: parseInt(r.triggerInterval, 10) || 0,
    soundName: r.soundName,
  }));
}
