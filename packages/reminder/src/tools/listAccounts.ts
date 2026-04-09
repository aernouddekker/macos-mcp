import { runAppleScript, parseRecords, FIELD_SEP, RECORD_SEP } from "../lib/applescript.js";

export async function listAccounts() {
  const script = `
tell application "Reminders"
  set output to ""
  repeat with a in every account
    set aName to ""
    try
      set aName to name of a as string
    end try
    set aId to ""
    try
      set aId to id of a as string
    end try
    set output to output & aName & "${FIELD_SEP}" & aId & "${RECORD_SEP}"
  end repeat
  return output
end tell`;

  const raw = await runAppleScript(script);
  return parseRecords(raw, ["name", "id"]);
}
