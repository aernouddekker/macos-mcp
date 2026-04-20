import { runAppleScript, escapeForAppleScript, withLaunch } from "../lib/applescript.js";

export interface AddressInput {
  label?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

function buildAddressProperties(address: AddressInput): string {
  const parts: string[] = [`label:"${escapeForAppleScript(address.label ?? "work")}"`];
  if (address.street) parts.push(`street:"${escapeForAppleScript(address.street)}"`);
  if (address.city) parts.push(`city:"${escapeForAppleScript(address.city)}"`);
  if (address.state) parts.push(`state:"${escapeForAppleScript(address.state)}"`);
  if (address.zip) parts.push(`zip:"${escapeForAppleScript(address.zip)}"`);
  if (address.country) parts.push(`country:"${escapeForAppleScript(address.country)}"`);
  return `{${parts.join(", ")}}`;
}

export async function createContact(
  firstName: string,
  lastName: string,
  email?: string,
  phone?: string,
  organization?: string,
  address?: AddressInput,
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
  const addressBlock = address
    ? `make new address at end of addresses of newPerson with properties ${buildAddressProperties(address)}`
    : "";

  const script = withLaunch("Contacts", `
tell application "Contacts"
  set newPerson to make new person with properties {first name:"${fName}", last name:"${lName}"}
  ${emailBlock}
  ${phoneBlock}
  ${orgBlock}
  ${addressBlock}
  save
  return id of newPerson
end tell`);

  const id = await runAppleScript(script);
  return { id: id.trim(), firstName, lastName, email, phone, organization, address };
}
