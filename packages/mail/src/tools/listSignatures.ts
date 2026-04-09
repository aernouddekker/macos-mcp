import { runAppleScript, parseRecords, withLaunch, FIELD_SEP, RECORD_SEP } from "../lib/applescript.js";

export async function listSignatures() {
  const script = withLaunch("Mail", `
tell application "Mail"
  set output to ""
  repeat with sig in every signature
    set output to output & (name of sig) & "${FIELD_SEP}" & (content of sig) & "${RECORD_SEP}"
  end repeat
  return output
end tell`);

  const raw = await runAppleScript(script);
  const records = parseRecords(raw, ["name", "content"]);

  return records.map((r) => ({ name: r.name, content: r.content }));
}
