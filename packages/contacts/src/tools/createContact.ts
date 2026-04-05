import { runAppleScript, escapeForAppleScript } from "@mailappmcp/shared";

export async function createContact(
  firstName: string,
  lastName: string,
  email?: string,
  phone?: string,
  organization?: string,
) {
  const fName = escapeForAppleScript(firstName);
  const lName = escapeForAppleScript(lastName);

  const emailBlock = email
    ? `make new email at end of emails of newPerson with properties {label:"work", value:"${escapeForAppleScript(email)}"}`
    : "";
  const phoneBlock = phone
    ? `make new phone at end of phones of newPerson with properties {label:"mobile", value:"${escapeForAppleScript(phone)}"}`
    : "";
  const orgBlock = organization
    ? `set organization of newPerson to "${escapeForAppleScript(organization)}"`
    : "";

  const script = `
tell application "Contacts"
  set newPerson to make new person with properties {first name:"${fName}", last name:"${lName}"}
  ${emailBlock}
  ${phoneBlock}
  ${orgBlock}
  save
  return id of newPerson
end tell`;

  const id = await runAppleScript(script);
  return { id: id.trim(), firstName, lastName, email, phone, organization };
}
