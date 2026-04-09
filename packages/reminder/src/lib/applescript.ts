export * from "./applescript-core.js";

export function withLaunch(app: string, body: string): string {
  return `tell application "${app}" to launch\n${body}`;
}
