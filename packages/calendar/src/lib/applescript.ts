export * from "./applescript-core.js";

export function withLaunch(app: string, body: string): string {
  return `do shell script "open -g -a ${app}"
repeat 50 times
  try
    tell application "${app}" to get name
    exit repeat
  on error
    delay 0.1
  end try
end repeat
${body}`;
}
