import { runAppleScript, escapeForAppleScript } from "../lib/applescript.js";
import fs from "fs";
import os from "os";
import path from "path";

export async function saveAttachment(
  account: string,
  mailbox: string,
  messageId: string,
  savePath?: string,
  attachmentName?: string,
) {
  const acct = escapeForAppleScript(account);
  const mbox = escapeForAppleScript(mailbox);
  const msgId = escapeForAppleScript(messageId);
  const dir = savePath ?? path.join(os.homedir(), "Downloads");
  fs.mkdirSync(dir, { recursive: true });
  const escapedDir = escapeForAppleScript(dir);

  let saveBlock: string;
  if (attachmentName) {
    const escapedName = escapeForAppleScript(attachmentName);
    saveBlock = `
  set savedFiles to ""
  repeat with att in mail attachments of m
    if name of att is "${escapedName}" then
      set filePath to "${escapedDir}/" & name of att
      save att in POSIX file filePath
      set savedFiles to savedFiles & name of att & "|||"
    end if
  end repeat`;
  } else {
    saveBlock = `
  set savedFiles to ""
  repeat with att in mail attachments of m
    set filePath to "${escapedDir}/" & name of att
    save att in POSIX file filePath
    set savedFiles to savedFiles & name of att & "|||"
  end repeat`;
  }

  const script = `
tell application "Mail"
  set msgs to (messages of mailbox "${mbox}" of account "${acct}" whose message id is "${msgId}")
  if (count of msgs) is 0 then
    return "NOT_FOUND"
  end if
  set m to item 1 of msgs
${saveBlock}
  return savedFiles
end tell`;

  const raw = await runAppleScript(script);
  if (raw === "NOT_FOUND") {
    return null;
  }

  const savedFiles = raw
    .split("|||")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return { savedFiles, directory: dir };
}
