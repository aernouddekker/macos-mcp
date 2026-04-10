import { runAppleScript, parseRecords, withLaunch, FIELD_SEP, RECORD_SEP } from "../lib/applescript.js";

export async function listSignatures() {
  const script = withLaunch("Mail", `
tell application "Mail"
  set output to ""
  repeat with sig in every signature
    set sigName to ""
    try
      set sigName to name of sig as string
    end try
    set sigContent to ""
    try
      set sigContent to content of sig as string
      if sigContent is "missing value" then set sigContent to ""
    end try
    set output to output & sigName & "${FIELD_SEP}" & sigContent & "${RECORD_SEP}"
  end repeat
  return output
end tell`);

  const raw = await runAppleScript(script);
  const records = parseRecords(raw, ["name", "content"]);

  return records.map((r) => ({ name: r.name, content: r.content }));
}
