import { runAppleScript, escapeForAppleScript, withLaunch } from "../lib/applescript.js";
import type { AddressInput } from "./createContact.js";

function buildAddressUpdateBlock(address: AddressInput): string {
  const setters: string[] = [];
  setters.push(`set label of existingAddr to "${escapeForAppleScript(address.label ?? "work")}"`);
  if (address.street !== undefined) setters.push(`set street of existingAddr to "${escapeForAppleScript(address.street)}"`);
  if (address.city !== undefined) setters.push(`set city of existingAddr to "${escapeForAppleScript(address.city)}"`);
  if (address.state !== undefined) setters.push(`set state of existingAddr to "${escapeForAppleScript(address.state)}"`);
  if (address.zip !== undefined) setters.push(`set zip of existingAddr to "${escapeForAppleScript(address.zip)}"`);
  if (address.country !== undefined) setters.push(`set country of existingAddr to "${escapeForAppleScript(address.country)}"`);

  const newProps: string[] = [`label:"${escapeForAppleScript(address.label ?? "work")}"`];
  if (address.street) newProps.push(`street:"${escapeForAppleScript(address.street)}"`);
  if (address.city) newProps.push(`city:"${escapeForAppleScript(address.city)}"`);
  if (address.state) newProps.push(`state:"${escapeForAppleScript(address.state)}"`);
  if (address.zip) newProps.push(`zip:"${escapeForAppleScript(address.zip)}"`);
  if (address.country) newProps.push(`country:"${escapeForAppleScript(address.country)}"`);

  return `
  if (count of addresses of p) > 0 then
    set existingAddr to first address of p
    ${setters.join("\n    ")}
  else
    make new address at end of addresses of p with properties {${newProps.join(", ")}}
  end if`;
}

export async function updateContact(
  contactId: string,
  firstName?: string,
  lastName?: string,
  email?: string,
  phone?: string,
  organization?: string,
  address?: AddressInput,
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
  const addressBlock = address !== undefined ? buildAddressUpdateBlock(address) : "";

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
  ${addressBlock}
  save
  return "ok"
end tell`);

  const result = await runAppleScript(script);
  if (result.trim() === "NOT_FOUND") {
    return null;
  }
  return { contactId, updated: { firstName, lastName, email, phone, organization, address } };
}
