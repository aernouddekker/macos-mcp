import { runAppleScript, escapeForAppleScript } from "../lib/applescript.js";

export async function deleteTable(
  document: string,
  table: string,
  sheet?: string,
) {
  const docEsc = escapeForAppleScript(document);
  const tableEsc = escapeForAppleScript(table);
  const sheetRef = sheet
    ? `sheet "${escapeForAppleScript(sheet)}"`
    : "sheet 1";

  const script = `
tell application "Numbers"
  tell ${sheetRef} of document "${docEsc}"
    delete table "${tableEsc}"
  end tell
end tell`;

  await runAppleScript(script);
  return {
    success: true,
    document,
    sheet: sheet ?? "sheet 1",
    table,
  };
}
