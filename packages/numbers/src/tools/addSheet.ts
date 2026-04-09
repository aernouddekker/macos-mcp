import { runAppleScript, escapeForAppleScript } from "../lib/applescript.js";

export async function addSheet(
  document: string,
  name?: string,
) {
  const docEsc = escapeForAppleScript(document);

  let script: string;
  if (name) {
    const nameEsc = escapeForAppleScript(name);
    script = `
tell application "Numbers"
  tell document "${docEsc}"
    make new sheet with properties {name:"${nameEsc}"}
  end tell
end tell`;
  } else {
    script = `
tell application "Numbers"
  tell document "${docEsc}"
    make new sheet
  end tell
end tell`;
  }

  await runAppleScript(script);
  return {
    success: true,
    document,
    name: name ?? null,
  };
}
