import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";

export async function deleteContact(contactId: string) {
  const cId = escapeForAppleScript(contactId);

  const script = `
tell application "Contacts"
  set personResults to (every person whose id is "${cId}")
  if (count of personResults) = 0 then
    return "CONTACT_NOT_FOUND"
  end if
  set p to item 1 of personResults
  delete p
  save
  return "deleted"
end tell`;

  const result = await runAppleScript(script);
  const trimmed = result.trim();
  if (trimmed === "CONTACT_NOT_FOUND") {
    return null;
  }
  return { success: true, contactId };
}
