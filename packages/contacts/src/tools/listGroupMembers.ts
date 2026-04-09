import { runAppleScript, escapeForAppleScript, parseRecords, withLaunch, FIELD_SEP, RECORD_SEP } from "../lib/applescript.js";

export async function listGroupMembers(groupName: string, limit = 100) {
  const gName = escapeForAppleScript(groupName);
  const maxCount = Math.floor(limit);

  const script = withLaunch("Contacts", `
tell application "Contacts"
  set groupResults to (every group whose name is "${gName}")
  if (count of groupResults) = 0 then
    return "GROUP_NOT_FOUND"
  end if
  set g to item 1 of groupResults
  set output to ""
  set i to 0
  repeat with p in people of g
    if i >= ${maxCount} then exit repeat
    set pId to id of p
    set pName to name of p
    set pEmail to ""
    try
      set pEmail to value of first email of p
    end try
    set pPhone to ""
    try
      set pPhone to value of first phone of p
    end try
    set output to output & pId & "${FIELD_SEP}" & pName & "${FIELD_SEP}" & pEmail & "${FIELD_SEP}" & pPhone & "${RECORD_SEP}"
    set i to i + 1
  end repeat
  return output
end tell`);

  const result = await runAppleScript(script);
  const trimmed = result.trim();
  if (trimmed === "GROUP_NOT_FOUND") {
    throw new Error(`Group not found: ${groupName}`);
  }
  return parseRecords(trimmed, ["id", "name", "email", "phone"]);
}
