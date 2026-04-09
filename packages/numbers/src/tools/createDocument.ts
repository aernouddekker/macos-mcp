import { runAppleScript, escapeForAppleScript } from "../lib/applescript.js";
import * as os from "os";
import * as path from "path";

export async function createDocument(name?: string) {
  let script: string;

  if (name) {
    const nameEsc = escapeForAppleScript(name);
    const savePath = path.join(os.homedir(), "Documents", `${name}.numbers`);
    const savePathEsc = escapeForAppleScript(savePath);

    script = `
tell application "Numbers"
  set newDoc to make new document
  save newDoc in POSIX file "${savePathEsc}"
  return name of newDoc
end tell`;
  } else {
    script = `
tell application "Numbers"
  set newDoc to make new document
  return name of newDoc
end tell`;
  }

  const result = await runAppleScript(script);
  return { name: result.trim() };
}
