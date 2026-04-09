import { runAppleScript, escapeForAppleScript } from "../lib/applescript.js";
import { parseCellRef } from "./readRange.js";

export async function writeRange(
  document: string,
  startCell: string,
  values: string[][],
  sheet?: string,
  table?: string,
) {
  const docEsc = escapeForAppleScript(document);
  const { row: startRow, col: startCol } = parseCellRef(startCell);

  const tableRef = table
    ? `table "${escapeForAppleScript(table)}"`
    : "table 1";
  const sheetRef = sheet
    ? `sheet "${escapeForAppleScript(sheet)}"`
    : "sheet 1";

  const setCmds: string[] = [];
  for (let r = 0; r < values.length; r++) {
    for (let c = 0; c < values[r].length; c++) {
      const valEsc = escapeForAppleScript(values[r][c]);
      setCmds.push(
        `set value of cell ${startCol + c} of row ${startRow + r} to "${valEsc}"`,
      );
    }
  }

  const script = `
tell application "Numbers"
  tell ${tableRef} of ${sheetRef} of document "${docEsc}"
    ${setCmds.join("\n    ")}
  end tell
end tell`;

  await runAppleScript(script);
  return {
    success: true,
    document,
    sheet: sheet ?? "sheet 1",
    table: table ?? "table 1",
    startCell,
    rowsWritten: values.length,
  };
}
