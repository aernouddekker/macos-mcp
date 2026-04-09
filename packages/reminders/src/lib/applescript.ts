export * from "./applescript-core.js";

export function withLaunch(app: string, body: string): string {
  return `if application "${app}" is not running then
  do shell script "open -g -a ${app}"
  repeat 30 times
    if application "${app}" is running then exit repeat
    delay 0.2
  end repeat
end if
${body}`;
}
