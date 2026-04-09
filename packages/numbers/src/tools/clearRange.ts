import { runAppleScript, escapeForAppleScript } from "../lib/applescript.js";

export async function clearRange(
  document: string,
  range: string,
  sheet?: string,
  table?: string,
) {
  const docEsc = escapeForAppleScript(document);
  const tableRef = table ? `table "${escapeForAppleScript(table)}"` : "table 1";
  const sheetRef = sheet ? `sheet "${escapeForAppleScript(sheet)}"` : "sheet 1";
  const rangeEsc = escapeForAppleScript(range);

  const script = `
tell application "Numbers"
  tell ${tableRef} of ${sheetRef} of document "${docEsc}"
    clear range "${rangeEsc}"
  end tell
end tell`;

  await runAppleScript(script);
  return { success: true, range };
}
