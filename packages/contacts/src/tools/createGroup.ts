import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";

export async function createGroup(name: string) {
  const gName = escapeForAppleScript(name);

  const script = `
tell application "Contacts"
  set newGroup to make new group with properties {name:"${gName}"}
  save
  return id of newGroup
end tell`;

  const id = (await runAppleScript(script)).trim();
  return { id, name };
}
