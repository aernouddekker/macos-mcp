import { runAppleScript, parseRecords, FIELD_SEP, RECORD_SEP } from "@mailappmcp/shared";

export async function listGroups() {
  const script = `
tell application "Contacts"
  set output to ""
  repeat with g in every group
    set gCount to 0
    try
      set gCount to count of people of g
    end try
    set output to output & (id of g) & "${FIELD_SEP}" & (name of g) & "${FIELD_SEP}" & gCount & "${RECORD_SEP}"
  end repeat
  return output
end tell`;

  const raw = await runAppleScript(script);
  const records = parseRecords(raw, ["id", "name", "memberCount"]);
  return records.map((r) => ({ ...r, memberCount: parseInt(r.memberCount, 10) || 0 }));
}
