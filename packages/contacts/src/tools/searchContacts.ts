import { runAppleScript, escapeForAppleScript, parseRecords, withLaunch, FIELD_SEP, RECORD_SEP } from "../lib/applescript.js";

export async function searchContacts(query: string, limit: number = 25) {
  const q = escapeForAppleScript(query);

  const script = withLaunch("Contacts", `
tell application "Contacts"
  set matchedPeople to {}
  try
    set nameMatches to (every person whose name contains "${q}")
    repeat with p in nameMatches
      set end of matchedPeople to p
    end repeat
  end try
  if (count of matchedPeople) = 0 then
    try
      set allPeople to every person
      repeat with p in allPeople
        set found to false
        repeat with e in emails of p
          if value of e contains "${q}" then
            set found to true
            exit repeat
          end if
        end repeat
        if not found then
          repeat with ph in phones of p
            if value of ph contains "${q}" then
              set found to true
              exit repeat
            end if
          end repeat
        end if
        if found then
          set end of matchedPeople to p
        end if
      end repeat
    end try
  end if
  set output to ""
  set maxCount to ${limit}
  set i to 0
  repeat with p in matchedPeople
    if i >= maxCount then exit repeat
    set pId to id of p
    set pName to name of p
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

  const raw = await runAppleScript(script);
  return parseRecords(raw, ["id", "name", "organization", "email", "phone"]);
}
