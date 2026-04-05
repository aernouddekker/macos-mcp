import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";

export async function readTable(
  document: string,
  sheet?: string,
  table?: string,
  headerRow: boolean = true,
) {
  const docEsc = escapeForAppleScript(document);

  const tableRef = table
    ? `table "${escapeForAppleScript(table)}"`
    : "table 1";
  const sheetRef = sheet
    ? `sheet "${escapeForAppleScript(sheet)}"`
    : "sheet 1";

  const script = `
tell application "Numbers"
  tell ${tableRef} of ${sheetRef} of document "${docEsc}"
    set numRows to row count
    set numCols to column count
    set output to ""
    repeat with r from 1 to numRows
      repeat with c from 1 to numCols
        set cellVal to value of cell c of row r
        if cellVal is missing value then
          set cellVal to ""
        end if
        set output to output & (cellVal as text) & "|||"
      end repeat
      set output to output & "~~~"
    end repeat
    return output
  end tell
end tell`;

  const raw = await runAppleScript(script);
  if (!raw) return headerRow ? [] : [];

  const rows = raw
    .split("~~~")
    .filter((r) => r.trim())
    .map((row) => {
      const cells = row.split("|||");
      // Remove trailing empty cell from the trailing ||| before ~~~
      if (cells[cells.length - 1] === "" || cells[cells.length - 1].trim() === "") {
        cells.pop();
      }
      return cells.map((v) => v.trim());
    });

  if (!headerRow) {
    return rows;
  }

  if (rows.length === 0) return [];

  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] ?? "";
    });
    return obj;
  });
}
