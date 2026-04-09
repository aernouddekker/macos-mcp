import { runAppleScript, escapeForAppleScript } from "../lib/applescript.js";

export async function addTable(
  document: string,
  sheet?: string,
  name?: string,
) {
  const docEsc = escapeForAppleScript(document);
  const sheetRef = sheet
    ? `sheet "${escapeForAppleScript(sheet)}"`
    : "sheet 1";

  let script: string;
  if (name) {
    const nameEsc = escapeForAppleScript(name);
    script = `
tell application "Numbers"
  tell ${sheetRef} of document "${docEsc}"
    make new table with properties {name:"${nameEsc}"}
  end tell
end tell`;
  } else {
    script = `
tell application "Numbers"
  tell ${sheetRef} of document "${docEsc}"
    make new table
  end tell
end tell`;
  }

  await runAppleScript(script);
  return {
    success: true,
    document,
    sheet: sheet ?? "sheet 1",
    name: name ?? null,
  };
}
