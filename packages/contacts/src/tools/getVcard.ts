import { runAppleScript, escapeForAppleScript } from "../lib/applescript.js";

export async function getVcard(contactId: string) {
  const cId = escapeForAppleScript(contactId);

  const script = `
tell application "Contacts"
  try
    set p to first person whose id is "${cId}"
    return vcard of p
  on error
    return "NOT_FOUND"
  end try
end tell`;

  const raw = await runAppleScript(script);
  if (raw.trim() === "NOT_FOUND") {
    return null;
  }

  return { vcard: raw.trim() };
}
