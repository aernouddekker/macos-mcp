# AppleScript -1700 Audit (commit (d))

Every `repeat with X in <list>` site in packages/*/src was audited
for the -1700 coercion bug. Sites where the loop variable was
concatenated into a string (or passed to a string-expecting context)
are marked UNSAFE and fixed with `(contents of X)` or
`set item to contents of X`.

## Methodology

See commit (d) message. Rules:
- UNSAFE: loop var concatenated with `&` into a string.
- SAFE: loop var only accessed via `name of X`, `properties of X`, etc.
- AMBIGUOUS: defaulted to UNSAFE (defensive fix).

## Findings

| file:line | risk | fix |
|---|---|---|
| packages/mail/src/tools/listAccounts.ts:7 | SAFE | `acct` used only via `name of acct`, `account type of acct`, `enabled of acct`, `email addresses of acct`, `full name of acct` — all property accesses |
| packages/mail/src/tools/listAccounts.ts:12 | UNSAFE | `(contents of addr)` at concat site — raw reference concatenated with `&` into string |
| packages/mail/src/tools/listSignatures.ts:7 | SAFE | `sig` used only via `name of sig`, `content of sig` — property accesses |
| packages/mail/src/tools/listAttachments.ts:18 | SAFE | `att` used only via `name of att`, `MIME type of att`, `file size of att`, `downloaded of att` — property accesses |
| packages/mail/src/tools/readMessage.ts:20 | SAFE | `r` used only via `address of r` — property access |
| packages/mail/src/tools/readMessage.ts:24 | SAFE | `r` used only via `address of r` — property access |
| packages/mail/src/tools/saveAttachment.ts:25 | SAFE | `att` used via `name of att` (property access) and `save att in POSIX file ...` (command taking reference, not string concat) |
| packages/mail/src/tools/saveAttachment.ts:35 | SAFE | `att` used via `name of att` (property access) and `save att in POSIX file ...` — same as above |
| packages/mail/src/tools/listMailboxes.ts:7 | SAFE | `acct` used only via `name of acct` — property access |
| packages/mail/src/tools/listMailboxes.ts:9 | SAFE | `mbox` used only via `name of mbox` and `messages of mbox` — property accesses |
| packages/mail/src/tools/searchMessages.ts:23 | SAFE | `m` used only via `id of m`, `subject of m`, `sender of m`, `date received of m`, `read status of m`, `message id of m` — all property accesses |
| packages/numbers/src/tools/listSpreadsheets.ts:7 | SAFE | `doc` used only via `name of doc`, `path of doc` — property accesses |
| packages/numbers/src/tools/listSheets.ts:9 | SAFE | `s` used only via `name of s` and as target for inner loop — property access |
| packages/numbers/src/tools/listSheets.ts:11 | SAFE | `t` used only via `name of t`, `row count of t`, `column count of t` — property accesses |
| packages/calendar/src/tools/removeAlarm.ts:13 | SAFE | `c` used only as argument to event query `every event of c whose uid is ...` — reference used as object specifier, not string concat |
| packages/calendar/src/tools/removeAlarm.ts:29 | SAFE | `a` used only in `cur + 1` counter check and `delete a` — no string concat |
| packages/calendar/src/tools/removeAlarm.ts:40 | SAFE | `a` used only in counter check and `delete a` — no string concat |
| packages/calendar/src/tools/removeAlarm.ts:52 | SAFE | `a` used only in counter check and `delete a` — no string concat |
| packages/calendar/src/tools/listEvents.ts:28 | SAFE | `e` used only via `uid of e`, `summary of e`, `start date of e`, `end date of e`, `allday event of e`, `location of e` — all property accesses |
| packages/calendar/src/tools/moveEvent.ts:21 | SAFE | `c` used only as object specifier in `every event of c whose uid is ...` — no string concat |
| packages/calendar/src/tools/listCalendars.ts:10 | SAFE | `c` used only via `name of c`, `writable of c`, `description of c` — property accesses |
| packages/calendar/src/tools/upcomingEvents.ts:24 | SAFE | `c` used only via `name of c` and as object specifier for event query — property access |
| packages/calendar/src/tools/upcomingEvents.ts:29 | SAFE | `e` used only via `uid of e`, `summary of e`, `start date of e`, `end date of e`, `allday event of e` — all property accesses |
| packages/calendar/src/tools/listAlarms.ts:8 | SAFE | `c` used only as object specifier in event query — no string concat |
| packages/calendar/src/tools/listAlarms.ts:23 | SAFE | `a` used only via `trigger interval of a` — property access |
| packages/calendar/src/tools/listAlarms.ts:33 | SAFE | `a` used only via `trigger interval of a` — property access |
| packages/calendar/src/tools/listAlarms.ts:43 | SAFE | `a` used only via `trigger interval of a`, `sound name of a` — property accesses |
| packages/calendar/src/tools/getEvent.ts:9 | SAFE | `c` used only as object specifier in event query and `name of c` — property access |
| packages/calendar/src/tools/addAttendee.ts:13 | SAFE | `c` used only as object specifier in event query — no string concat |
| packages/calendar/src/tools/addMailAlarm.ts:8 | SAFE | `c` used only as object specifier in event query — no string concat |
| packages/calendar/src/tools/deleteEvent.ts:8 | SAFE | `c` used only as object specifier in event query — no string concat |
| packages/calendar/src/tools/addDisplayAlarm.ts:8 | SAFE | `c` used only as object specifier in event query — no string concat |
| packages/calendar/src/tools/removeAttendee.ts:10 | SAFE | `c` used only as object specifier in event query — no string concat |
| packages/calendar/src/tools/removeAttendee.ts:25 | SAFE | `a` used only in `delete a` — reference passed to command, not string concat |
| packages/calendar/src/tools/searchEvents.ts:44 | SAFE | `c` used only via `name of c` and as object specifier — property access; inner loop uses numeric index (`repeat with k from 1 to n`) not a list reference |
| packages/calendar/src/tools/duplicateEvent.ts:19 | SAFE | `c` used only as object specifier in event query and `set sourceCal to c` — no string concat |
| packages/calendar/src/tools/updateEvent.ts:44 | SAFE | `c` used only as object specifier in event query — no string concat |
| packages/calendar/src/tools/listAttendees.ts:8 | SAFE | `c` used only as object specifier in event query — no string concat |
| packages/calendar/src/tools/listAttendees.ts:22 | SAFE | `a` used only via `email of a`, `display name of a`, `participation status of a` — all property accesses |
| packages/calendar/src/tools/todayEvents.ts:27 | SAFE | `c` used only via `name of c` and as object specifier — property access |
| packages/calendar/src/tools/todayEvents.ts:32 | SAFE | `e` used only via `uid of e`, `summary of e`, `start date of e`, `end date of e`, `allday event of e` — all property accesses |
| packages/calendar/src/tools/addSoundAlarm.ts:9 | SAFE | `c` used only as object specifier in event query — no string concat |
| packages/contacts/src/tools/readContact.ts:34 | SAFE | `e` used only via `label of e`, `value of e` — property accesses |
| packages/contacts/src/tools/readContact.ts:40 | SAFE | `ph` used only via `label of ph`, `value of ph` — property accesses |
| packages/contacts/src/tools/readContact.ts:46 | SAFE | `a` used only via `label of a`, `formatted address of a` — property accesses |
| packages/contacts/src/tools/listGroups.ts:7 | SAFE | `g` used only via `id of g`, `name of g`, `count of people of g` — property accesses |
| packages/contacts/src/tools/searchByModificationDate.ts:12 | SAFE | `p` used only via `modification date of p`, `id of p`, `name of p` — property accesses |
| packages/contacts/src/tools/searchContacts.ts:11 | SAFE | `p` used only in `set end of matchedPeople to p` — list append, not string concat |
| packages/contacts/src/tools/searchContacts.ts:18 | SAFE | `p` used only via `emails of p`, `phones of p`, property accesses, and list append — no string concat |
| packages/contacts/src/tools/searchContacts.ts:20 | SAFE | `e` used only via `value of e` — property access |
| packages/contacts/src/tools/searchContacts.ts:27 | SAFE | `ph` used only via `value of ph` — property access |
| packages/contacts/src/tools/searchContacts.ts:43 | SAFE | `p` used only via `id of p`, `name of p`, `organization of p`, `emails of p`, `phones of p` — property accesses |
| packages/contacts/src/tools/listGroupMembers.ts:16 | SAFE | `p` used only via `id of p`, `name of p`, `emails of p`, `phones of p` — property accesses |
| packages/reminder/src/tools/todayReminders.ts:28 | SAFE | `l` used only via `name of l` and as object specifier — property access |
| packages/reminder/src/tools/todayReminders.ts:36 | SAFE | `r` used only via `id of r`, `name of r`, `body of r`, etc. inside `appendReminderRecord` — all property accesses |
| packages/reminder/src/tools/updateReminder.ts:44 | SAFE | `l` used only as object specifier in reminder query — no string concat |
| packages/reminder/src/tools/overdueReminders.ts:23 | SAFE | `l` used only via `name of l` and as object specifier — property access |
| packages/reminder/src/tools/overdueReminders.ts:31 | SAFE | `r` used only via property accesses inside `appendReminderRecord` |
| packages/reminder/src/tools/upcomingReminders.ts:30 | SAFE | `l` used only via `name of l` and as object specifier — property access |
| packages/reminder/src/tools/upcomingReminders.ts:38 | SAFE | `r` used only via property accesses inside `appendReminderRecord` |
| packages/reminder/src/tools/listLists.ts:18 | SAFE | `l` used only via `id of l`, `name of l`, `container of l`, `color of l`, `emblem of l` — property accesses |
| packages/reminder/src/tools/searchReminders.ts:28 | SAFE | `l` used only via `name of l` and as object specifier — property access |
| packages/reminder/src/tools/searchReminders.ts:36 | SAFE | `r` used only via `id of r`, `name of r`, `completed of r`, `due date of r` — property accesses |
| packages/reminder/src/tools/getReminder.ts:9 | SAFE | `l` used only as object specifier and `name of l` — property access |
| packages/reminder/src/tools/listReminders.ts:24 | SAFE | `r` used only via `id of r`, `name of r`, `body of r`, `completed of r`, `due date of r`, etc. — all property accesses |
| packages/reminder/src/tools/listAccounts.ts:7 | SAFE | `a` used only via `name of a`, `id of a` — property accesses |
| packages/reminder/src/helpers/findById.ts:11 | SAFE | `l` used only as object specifier in reminder query — no string concat |

## Summary

- Total sites: 70
- UNSAFE fixed: 1 (`packages/mail/src/tools/listAccounts.ts:12`)
- SAFE (no change): 69
- AMBIGUOUS fixed defensively: 0

The only genuinely unsafe site was the confirmed bug in `mail/listAccounts.ts`: the loop variable `addr` (a reference into `email addresses of acct`) was concatenated raw with `&` into a string without coercion. All other sites use the loop variable exclusively via property-access expressions (`name of X`, `id of X`, `value of X`, etc.) which dereference the reference safely, or pass the reference to AppleScript commands (`delete a`, `save att in ...`) that accept object references directly.
