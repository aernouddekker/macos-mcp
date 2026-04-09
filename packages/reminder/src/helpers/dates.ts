/**
 * Build a locale-safe AppleScript snippet that constructs a date by mutating
 * `current date`. Avoids `date "string"` parsing which depends on the user's
 * locale and short-date format.
 */
export function appleScriptDateHelper(): string {
  return `
on __makeDate(y, m, d, hh, mm, ss)
  set theDate to current date
  set year of theDate to y
  set month of theDate to m
  set day of theDate to d
  set hours of theDate to hh
  set minutes of theDate to mm
  set seconds of theDate to ss
  return theDate
end __makeDate
`;
}

/**
 * Convert an ISO 8601 date string into an AppleScript expression that
 * evaluates to the corresponding `date` value. Timezone is interpreted as
 * the local Mac timezone (matches Reminders.app default behavior).
 */
export function isoToAppleScriptDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid ISO date string: ${iso}`);
  }
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const hh = d.getHours();
  const mm = d.getMinutes();
  const ss = d.getSeconds();
  return `(my __makeDate(${y}, ${m}, ${day}, ${hh}, ${mm}, ${ss}))`;
}
