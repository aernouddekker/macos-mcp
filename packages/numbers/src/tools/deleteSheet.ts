import { runAppleScript, escapeForAppleScript, withLaunch } from "../lib/applescript.js";

export async function deleteSheet(
  document: string,
  sheet: string,
) {
  const docEsc = escapeForAppleScript(document);
  const sheetEsc = escapeForAppleScript(sheet);

  const script = withLaunch("Numbers", `
tell application "Numbers"
  tell document "${docEsc}"
    delete sheet "${sheetEsc}"
  end tell
end tell`);

  await runAppleScript(script);
  return {
    success: true,
    document,
    sheet,
  };
}
