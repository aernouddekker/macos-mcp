import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";

export async function renameTable(
  document: string,
  table: string,
  newName: string,
  sheet?: string,
) {
  const docEsc = escapeForAppleScript(document);
  const tableEsc = escapeForAppleScript(table);
  const newNameEsc = escapeForAppleScript(newName);
  const sheetRef = sheet ? `sheet "${escapeForAppleScript(sheet)}"` : "sheet 1";

  const script = `
tell application "Numbers"
  set name of table "${tableEsc}" of ${sheetRef} of document "${docEsc}" to "${newNameEsc}"
end tell`;

  await runAppleScript(script);
  return { success: true, document, oldName: table, newName };
}
