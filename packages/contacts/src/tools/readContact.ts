import { runAppleScript, escapeForAppleScript, withLaunch, FIELD_SEP } from "../lib/applescript.js";

export async function readContact(contactId: string) {
  const cId = escapeForAppleScript(contactId);

  const script = withLaunch("Contacts", `
tell application "Contacts"
  set results to (every person whose id is "${cId}")
  if (count of results) = 0 then
    return "NOT_FOUND"
  end if
  set p to item 1 of results
  set pName to ""
  try
    set pName to name of p
  end try
  set pFirst to ""
  try
    set pFirst to first name of p as string
    if pFirst is "missing value" then set pFirst to ""
  end try
  set pLast to ""
  try
    set pLast to last name of p as string
    if pLast is "missing value" then set pLast to ""
  end try
  set pOrg to ""
  try
    set pOrg to organization of p as string
    if pOrg is "missing value" then set pOrg to ""
  end try
  set emailList to ""
  try
    repeat with e in emails of p
      set emailList to emailList & (label of e) & ":" & (value of e) & ","
    end repeat
  end try
  set phoneList to ""
  try
    repeat with ph in phones of p
      set phoneList to phoneList & (label of ph) & ":" & (value of ph) & ","
    end repeat
  end try
  set addrList to ""
  try
    repeat with a in addresses of p
      set addrList to addrList & (label of a) & ":" & (formatted address of a) & ","
    end repeat
  end try
  set pNote to ""
  try
    set pNote to note of p as string
    if pNote is "missing value" then set pNote to ""
  end try
  return pName & "${FIELD_SEP}" & pFirst & "${FIELD_SEP}" & pLast & "${FIELD_SEP}" & pOrg & "${FIELD_SEP}" & emailList & "${FIELD_SEP}" & phoneList & "${FIELD_SEP}" & addrList & "${FIELD_SEP}" & pNote
end tell`);

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") {
    return null;
  }

  const parts = raw.split(FIELD_SEP);
  const parseList = (s: string) =>
    (s ?? "")
      .trim()
      .split(",")
      .filter(Boolean)
      .map((item) => {
        const colonIdx = item.indexOf(":");
        if (colonIdx === -1) return { label: "", value: item };
        return { label: item.slice(0, colonIdx), value: item.slice(colonIdx + 1) };
      });

  return {
    name: (parts[0] ?? "").trim(),
    firstName: (parts[1] ?? "").trim(),
    lastName: (parts[2] ?? "").trim(),
    organization: (parts[3] ?? "").trim(),
    emails: parseList(parts[4] ?? ""),
    phones: parseList(parts[5] ?? ""),
    addresses: parseList(parts[6] ?? ""),
    note: (parts[7] ?? "").trim(),
  };
}
