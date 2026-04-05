import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";

export async function deleteGroup(groupName: string) {
  const gName = escapeForAppleScript(groupName);

  const script = `
tell application "Contacts"
  set groupResults to (every group whose name is "${gName}")
  if (count of groupResults) = 0 then
    return "GROUP_NOT_FOUND"
  end if
  set g to item 1 of groupResults
  delete g
  save
  return "deleted"
end tell`;

  const result = await runAppleScript(script);
  const trimmed = result.trim();
  if (trimmed === "GROUP_NOT_FOUND") {
    throw new Error(`Group not found: ${groupName}`);
  }
  return { success: true, groupName };
}
