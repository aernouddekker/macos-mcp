import { runAppleScript, escapeForAppleScript, withLaunch } from "../lib/applescript.js";

export async function renameSheet(
  document: string,
  sheet: string,
  newName: string,
) {
  const docEsc = escapeForAppleScript(document);
  const sheetEsc = escapeForAppleScript(sheet);
  const newNameEsc = escapeForAppleScript(newName);

  const script = withLaunch("Numbers", `
tell application "Numbers"
  set name of sheet "${sheetEsc}" of document "${docEsc}" to "${newNameEsc}"
end tell`);

  await runAppleScript(script);
  return {
    success: true,
    document,
    sheet,
    newName,
  };
}
