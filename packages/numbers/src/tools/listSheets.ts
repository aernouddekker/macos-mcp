import { runAppleScript, escapeForAppleScript, parseRecords } from "@mailappmcp/shared";

export async function listSheets(document: string) {
  const docEsc = escapeForAppleScript(document);
  const script = `
tell application "Numbers"
  tell document "${docEsc}"
    set output to ""
    repeat with s in every sheet
      set sheetName to name of s
      repeat with t in every table of s
        set output to output & sheetName & "|||" & (name of t) & "|||" & (row count of t) & "|||" & (column count of t) & "~~~"
      end repeat
    end repeat
  end tell
  return output
end tell`;

  const raw = await runAppleScript(script);
  return parseRecords(raw, ["sheet", "table", "rowCount", "columnCount"]);
}
