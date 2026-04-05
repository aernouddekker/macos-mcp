import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";

export async function renameSheet(
  document: string,
  sheet: string,
  newName: string,
) {
  const docEsc = escapeForAppleScript(document);
  const sheetEsc = escapeForAppleScript(sheet);
  const newNameEsc = escapeForAppleScript(newName);

  const script = `
tell application "Numbers"
  set name of sheet "${sheetEsc}" of document "${docEsc}" to "${newNameEsc}"
end tell`;

  await runAppleScript(script);
  return {
    success: true,
    document,
    sheet,
    newName,
  };
}
