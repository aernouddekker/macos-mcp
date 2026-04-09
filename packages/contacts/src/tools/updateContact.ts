import { runAppleScript, escapeForAppleScript, withLaunch } from "../lib/applescript.js";

export async function updateContact(
  contactId: string,
  firstName?: string,
  lastName?: string,
  email?: string,
  phone?: string,
  organization?: string,
) {
  const cId = escapeForAppleScript(contactId);

  const firstNameBlock = firstName !== undefined
    ? `set first name of p to "${escapeForAppleScript(firstName)}"`
    : "";
  const lastNameBlock = lastName !== undefined
    ? `set last name of p to "${escapeForAppleScript(lastName)}"`
    : "";
  const orgBlock = organization !== undefined
    ? `set organization of p to "${escapeForAppleScript(organization)}"`
    : "";
  const emailBlock = email !== undefined
    ? `
  if (count of emails of p) > 0 then
    set value of first email of p to "${escapeForAppleScript(email)}"
  else
    make new email at end of emails of p with properties {label:"work", value:"${escapeForAppleScript(email)}"}
  end if`
    : "";
  const phoneBlock = phone !== undefined
    ? `
  if (count of phones of p) > 0 then
    set value of first phone of p to "${escapeForAppleScript(phone)}"
  else
    make new phone at end of phones of p with properties {label:"mobile", value:"${escapeForAppleScript(phone)}"}
  end if`
    : "";

  const script = withLaunch("Contacts", `
tell application "Contacts"
  set results to (every person whose id is "${cId}")
  if (count of results) = 0 then
    return "NOT_FOUND"
  end if
  set p to item 1 of results
  ${firstNameBlock}
  ${lastNameBlock}
  ${orgBlock}
  ${emailBlock}
  ${phoneBlock}
  save
  return "ok"
end tell`);

  const result = await runAppleScript(script);
  if (result.trim() === "NOT_FOUND") {
    return null;
  }
  return { contactId, updated: { firstName, lastName, email, phone, organization } };
}
