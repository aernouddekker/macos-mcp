import { runAppleScript, escapeForAppleScript, FIELD_SEP } from "@mailappmcp/shared";

export async function extractEmailAddress(input: string) {
  const escaped = escapeForAppleScript(input);

  const script = `
tell application "Mail"
  set addr to extract address from "${escaped}"
  set fullName to extract name from "${escaped}"
  return fullName & "${FIELD_SEP}" & addr
end tell`;

  const raw = await runAppleScript(script);
  const sepIdx = raw.indexOf(FIELD_SEP);
  if (sepIdx === -1) {
    return { name: "", address: raw.trim() };
  }

  return {
    name: raw.slice(0, sepIdx).trim(),
    address: raw.slice(sepIdx + FIELD_SEP.length).trim(),
  };
}
