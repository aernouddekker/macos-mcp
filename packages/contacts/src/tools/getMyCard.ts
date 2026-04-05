import { runAppleScript, FIELD_SEP } from "@mailappmcp/shared";

export async function getMyCard() {
  const script = `
tell application "Contacts"
  set p to my card
  set pId to id of p
  set pName to name of p
  set pEmail to ""
  try
    set pEmail to value of first email of p
  end try
  set pPhone to ""
  try
    set pPhone to value of first phone of p
  end try
  set pOrg to ""
  try
    set pOrg to organization of p
  end try
  return pId & "${FIELD_SEP}" & pName & "${FIELD_SEP}" & pOrg & "${FIELD_SEP}" & pEmail & "${FIELD_SEP}" & pPhone
end tell`;

  const raw = await runAppleScript(script);
  const parts = raw.split(FIELD_SEP);

  return {
    id: (parts[0] ?? "").trim(),
    name: (parts[1] ?? "").trim(),
    organization: (parts[2] ?? "").trim(),
    email: (parts[3] ?? "").trim(),
    phone: (parts[4] ?? "").trim(),
  };
}
