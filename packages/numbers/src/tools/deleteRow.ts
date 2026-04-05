import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";

export async function deleteRow(
  document: string,
  row: number,
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

  const script = `
tell application "Numbers"
  tell ${tableRef} of ${sheetRef} of document "${docEsc}"
    delete row ${row}
  end tell
end tell`;

  await runAppleScript(script);
  return {
    success: true,
    document,
    sheet: sheet ?? "sheet 1",
    table: table ?? "table 1",
    row,
  };
}
