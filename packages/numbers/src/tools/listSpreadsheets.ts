import { runAppleScript, parseRecords } from "../lib/applescript.js";

export async function listSpreadsheets() {
  const script = `
tell application "Numbers"
  set output to ""
  repeat with doc in every document
    set docPath to ""
    try
      set docPath to path of doc
    end try
    set output to output & (name of doc) & "|||" & docPath & "~~~"
  end repeat
  return output
end tell`;

  const raw = await runAppleScript(script);
  return parseRecords(raw, ["name", "path"]);
}
