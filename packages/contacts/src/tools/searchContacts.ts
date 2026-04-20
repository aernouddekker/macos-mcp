import { runAppleScript, escapeForAppleScript, parseRecords, withLaunch, FIELD_SEP, RECORD_SEP } from "../lib/applescript.js";

export async function searchContacts(query: string, limit: number = 25) {
  const q = escapeForAppleScript(query);

  const script = withLaunch("Contacts", `
tell application "Contacts"
  set matchedPeople to {}
  set seenIds to {}

  set maxCount to ${limit}

  try
    set nameMatches to (every person whose name contains "${q}")
    repeat with p in nameMatches
      if (count of matchedPeople) is greater than or equal to maxCount then exit repeat
      set pId to id of p as string
      if seenIds does not contain pId then
        set end of seenIds to pId
        set end of matchedPeople to contents of p
      end if
    end repeat
  end try

  if (count of matchedPeople) < maxCount then
    try
      set orgMatches to (every person whose organization contains "${q}")
      repeat with p in orgMatches
        if (count of matchedPeople) is greater than or equal to maxCount then exit repeat
        set pId to id of p as string
        if seenIds does not contain pId then
          set end of seenIds to pId
          set end of matchedPeople to contents of p
        end if
      end repeat
    end try
  end if

  if (count of matchedPeople) < maxCount then
    try
      set emailMatches to (every person whose (count of (emails whose value contains "${q}")) > 0)
      repeat with p in emailMatches
        if (count of matchedPeople) is greater than or equal to maxCount then exit repeat
        set pId to id of p as string
        if seenIds does not contain pId then
          set end of seenIds to pId
          set end of matchedPeople to contents of p
        end if
      end repeat
    end try
  end if

  if (count of matchedPeople) < maxCount then
    try
      set phoneMatches to (every person whose (count of (phones whose value contains "${q}")) > 0)
      repeat with p in phoneMatches
        if (count of matchedPeople) is greater than or equal to maxCount then exit repeat
        set pId to id of p as string
        if seenIds does not contain pId then
          set end of seenIds to pId
          set end of matchedPeople to contents of p
        end if
      end repeat
    end try
  end if

  set output to ""
  set i to 0
  repeat with p in matchedPeople
    if i is greater than or equal to maxCount then exit repeat
    set pId to ""
    try
      set pId to id of p as string
    end try
    set pName to ""
    try
      set pName to name of p as string
    end try
    set pOrg to ""
    try
      set pOrg to organization of p as string
    end try
    if pOrg is "missing value" then set pOrg to ""
    set pEmail to ""
    try
      if (count of emails of p) > 0 then
        set pEmail to value of first email of p
      end if
    end try
    set pPhone to ""
    try
      if (count of phones of p) > 0 then
        set pPhone to value of first phone of p
      end if
    end try
    set output to output & pId & "${FIELD_SEP}" & pName & "${FIELD_SEP}" & pOrg & "${FIELD_SEP}" & pEmail & "${FIELD_SEP}" & pPhone & "${RECORD_SEP}"
    set i to i + 1
  end repeat
  return output
end tell`);

  let raw: string;
  try {
    raw = await runAppleScript(script);
  } catch {
    return [];
  }
  return parseRecords(raw, ["id", "name", "organization", "email", "phone"]);
}
