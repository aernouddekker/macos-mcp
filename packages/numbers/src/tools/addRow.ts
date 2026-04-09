import { runAppleScript, escapeForAppleScript } from "../lib/applescript.js";

export async function addRow(
  document: string,
  values: string[],
  sheet?: string,
  table?: string,
) {
  const docEsc = escapeForAppleScript(document);

  const tableRef = table
    ? `table "${escapeForAppleScript(table)}"`
    : "table 1";
  const sheetRef = sheet
    ? `sheet "${escapeForAppleScript(sheet)}"`
    : "sheet 1";

  const setCmds = values.map((v, i) => {
    const valEsc = escapeForAppleScript(v);
    return `set value of cell ${i + 1} of row newRowIndex to "${valEsc}"`;
  });

  const script = `
tell application "Numbers"
  tell ${tableRef} of ${sheetRef} of document "${docEsc}"
    set rowCount to row count
    add row below row rowCount
    set newRowIndex to rowCount + 1
    ${setCmds.join("\n    ")}
  end tell
end tell`;

  await runAppleScript(script);
  return {
    success: true,
    document,
    sheet: sheet ?? "sheet 1",
    table: table ?? "table 1",
    valuesWritten: values.length,
  };
}
