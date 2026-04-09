/**
 * AppleScript snippet that searches every list for a reminder with the given
 * (already-escaped) id and binds the result to `foundReminder`. If not found,
 * returns "NOT_FOUND" from the enclosing tell block.
 *
 * Caller must `escapeForAppleScript` the id before passing it in.
 */
export function findReminderById(escapedId: string): string {
  return `
  set foundReminder to missing value
  repeat with l in every list
    try
      set results to (every reminder of l whose id is "${escapedId}")
      if (count of results) > 0 then
        set foundReminder to item 1 of results
        exit repeat
      end if
    end try
  end repeat
  if foundReminder is missing value then
    return "NOT_FOUND"
  end if`;
}
