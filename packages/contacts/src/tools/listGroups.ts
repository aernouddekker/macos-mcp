import { runAppleScript, parseRecords, withLaunch, FIELD_SEP, RECORD_SEP } from "../lib/applescript.js";

export async function listGroups() {
  const script = withLaunch("Contacts", `
tell application "Contacts"
  set output to ""
  repeat with g in every group
    set gId to ""
    try
      set gId to id of g as string
    end try
    set gName to ""
    try
      set gName to name of g as string
    end try
    set gCount to 0
    try
      set gCount to count of people of g
    end try
    set output to output & gId & "${FIELD_SEP}" & gName & "${FIELD_SEP}" & gCount & "${RECORD_SEP}"
  end repeat
  return output
end tell`);

  const raw = await runAppleScript(script);
  const records = parseRecords(raw, ["id", "name", "memberCount"]);
  return records.map((r) => ({ ...r, memberCount: parseInt(r.memberCount, 10) || 0 }));
}
