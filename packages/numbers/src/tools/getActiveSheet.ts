import { runAppleScript, escapeForAppleScript } from "../lib/applescript.js";

export async function getActiveSheet(document: string) {
  const docEsc = escapeForAppleScript(document);

  const script = `
tell application "Numbers"
  tell document "${docEsc}"
    set s to active sheet
    return name of s
  end tell
end tell`;

  const result = await runAppleScript(script);
  return { name: result.trim() };
}
