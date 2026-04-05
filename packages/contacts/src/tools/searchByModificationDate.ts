import { runAppleScript, escapeForAppleScript, FIELD_SEP, RECORD_SEP } from "@mailappmcp/shared";

export async function searchByModificationDate(since: string, limit: number) {
  const escapedDate = escapeForAppleScript(since);

  const script = `
tell application "Contacts"
  set cutoffDate to date "${escapedDate}"
  set output to ""
  set i to 0
  set maxLimit to ${limit}
  repeat with p in every person
    if i >= maxLimit then exit repeat
    if modification date of p > cutoffDate then
      set pId to id of p
      set pName to name of p
      set modDate to modification date of p as string
      set output to output & pId & "${FIELD_SEP}" & pName & "${FIELD_SEP}" & modDate & "${RECORD_SEP}"
      set i to i + 1
    end if
  end repeat
  return output
end tell`;

  const raw = await runAppleScript(script);
  if (!raw.trim()) {
    return [];
  }

  return raw
    .split(RECORD_SEP)
    .filter((r) => r.trim())
    .map((record) => {
      const fields = record.split(FIELD_SEP);
      return {
        id: (fields[0] ?? "").trim(),
        name: (fields[1] ?? "").trim(),
        modificationDate: (fields[2] ?? "").trim(),
      };
    });
}
