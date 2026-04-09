import { runAppleScript, escapeForAppleScript } from "../lib/applescript.js";

function colLetterToNum(col: string): number {
  let n = 0;
  for (const ch of col.toUpperCase()) {
    n = n * 26 + (ch.charCodeAt(0) - 64);
  }
  return n;
}

export async function sortTable(
  document: string,
  column: string,
  direction: "ascending" | "descending",
  sheet?: string,
  table?: string,
) {
  const docEsc = escapeForAppleScript(document);
  const tableRef = table ? `table "${escapeForAppleScript(table)}"` : "table 1";
  const sheetRef = sheet ? `sheet "${escapeForAppleScript(sheet)}"` : "sheet 1";
  const colNum = colLetterToNum(column);

  const script = `
tell application "Numbers"
  tell ${tableRef} of ${sheetRef} of document "${docEsc}"
    sort by column ${colNum} direction ${direction}
  end tell
end tell`;

  await runAppleScript(script);
  return { success: true, document, column, direction };
}
