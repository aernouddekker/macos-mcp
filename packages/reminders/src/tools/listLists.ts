import { runAppleScript, escapeForAppleScript, parseRecords, withLaunch, FIELD_SEP, RECORD_SEP } from "../lib/applescript.js";

export async function listLists(accountName?: string) {
  const aName = accountName ? escapeForAppleScript(accountName) : "";

  const targetBlock = accountName
    ? `set acctResults to (every account whose name is "${aName}")
  if (count of acctResults) = 0 then
    return "NOT_FOUND"
  end if
  set targetLists to every list of (item 1 of acctResults)`
    : `set targetLists to every list`;

  const script = withLaunch("Reminders", `
tell application "Reminders"
  ${targetBlock}
  set output to ""
  repeat with l in targetLists
    set lId to ""
    try
      set lId to id of l as string
    end try
    set lName to ""
    try
      set lName to name of l as string
    end try
    set lContainer to ""
    try
      set lContainer to name of (container of l) as string
    end try
    set lColor to ""
    try
      set lColor to color of l as string
      if lColor is "missing value" then set lColor to ""
    end try
    set lEmblem to ""
    try
      set lEmblem to emblem of l as string
      if lEmblem is "missing value" then set lEmblem to ""
    end try
    set output to output & lId & "${FIELD_SEP}" & lName & "${FIELD_SEP}" & lContainer & "${FIELD_SEP}" & lColor & "${FIELD_SEP}" & lEmblem & "${RECORD_SEP}"
  end repeat
  return output
end tell`);

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") return null;
  return parseRecords(raw, ["id", "name", "account", "color", "emblem"]);
}
