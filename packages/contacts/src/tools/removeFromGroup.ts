import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";

export async function removeFromGroup(contactId: string, groupName: string) {
  const cId = escapeForAppleScript(contactId);
  const gName = escapeForAppleScript(groupName);

  const script = `
tell application "Contacts"
  set personResults to (every person whose id is "${cId}")
  if (count of personResults) = 0 then
    return "CONTACT_NOT_FOUND"
  end if
  set groupResults to (every group whose name is "${gName}")
  if (count of groupResults) = 0 then
    return "GROUP_NOT_FOUND"
  end if
  set p to item 1 of personResults
  set g to item 1 of groupResults
  remove p from g
  save
  return "done"
end tell`;

  const result = await runAppleScript(script);
  const trimmed = result.trim();
  if (trimmed === "CONTACT_NOT_FOUND") {
    throw new Error(`Contact not found: ${contactId}`);
  }
  if (trimmed === "GROUP_NOT_FOUND") {
    throw new Error(`Group not found: ${groupName}`);
  }
  return { success: true };
}
