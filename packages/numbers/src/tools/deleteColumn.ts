import { runAppleScript, escapeForAppleScript } from "../lib/applescript.js";

function colLetterToNum(col: string): number {
  let n = 0;
  for (const ch of col.toUpperCase()) {
    n = n * 26 + (ch.charCodeAt(0) - 64);
  }
  return n;
}

export async function deleteColumn(
  document: string,
  column: string,
  sheet?: string,
  table?: string,
) {
  const docEsc = escapeForAppleScript(document);
  const colNum = colLetterToNum(column);

  const tableRef = table
    ? `table "${escapeForAppleScript(table)}"`
    : "table 1";
  const sheetRef = sheet
    ? `sheet "${escapeForAppleScript(sheet)}"`
    : "sheet 1";

  const script = `
tell application "Numbers"
  tell ${tableRef} of ${sheetRef} of document "${docEsc}"
    delete column ${colNum}
  end tell
end tell`;

  await runAppleScript(script);
  return {
    success: true,
    document,
    sheet: sheet ?? "sheet 1",
    table: table ?? "table 1",
    column,
  };
}
