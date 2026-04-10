import { runAppleScript, escapeForAppleScript, parseRecords } from "../lib/applescript.js";

export async function listSheets(document: string) {
  const docEsc = escapeForAppleScript(document);
  const script = `
tell application "Numbers"
  tell document "${docEsc}"
    set output to ""
    repeat with s in every sheet
      set sheetName to ""
      try
        set sheetName to name of s as string
      end try
      try
        repeat with t in every table of s
          set tName to ""
          try
            set tName to name of t as string
          end try
          set tRows to ""
          try
            set tRows to (row count of t) as string
          end try
          set tCols to ""
          try
            set tCols to (column count of t) as string
          end try
          set output to output & sheetName & "|||" & tName & "|||" & tRows & "|||" & tCols & "~~~"
        end repeat
      end try
    end repeat
  end tell
  return output
end tell`;

  const raw = await runAppleScript(script);
  return parseRecords(raw, ["sheet", "table", "rowCount", "columnCount"]);
}
