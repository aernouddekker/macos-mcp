import { runAppleScript, parseRecords, withLaunch } from "../lib/applescript.js";

export async function listSpreadsheets() {
  const script = withLaunch("Numbers", `
tell application "Numbers"
  set output to ""
  repeat with doc in every document
    set docName to ""
    try
      set docName to name of doc as string
    end try
    set docPath to ""
    try
      set docPath to path of doc as string
      if docPath is "missing value" then set docPath to ""
    end try
    set output to output & docName & "|||" & docPath & "~~~"
  end repeat
  return output
end tell`);

  const raw = await runAppleScript(script);
  return parseRecords(raw, ["name", "path"]);
}
