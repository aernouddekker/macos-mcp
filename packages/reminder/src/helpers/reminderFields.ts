import { FIELD_SEP, RECORD_SEP } from "../lib/applescript.js";

/**
 * AppleScript snippet that, given a variable `r` bound to a reminder, appends
 * a delimited record (id, name, body, completed, dueDate, allDayDueDate,
 * remindMeDate, priority, flagged, listName) to a variable `output`. Pass the
 * list-name expression as `listExpr` (an AppleScript expression that evaluates
 * to a string — e.g. `lName` or `"My List"`).
 */
export function appendReminderRecord(listExpr: string): string {
  return `
        set rId to ""
        try
          set rId to id of r as string
        end try
        set rName to ""
        try
          set rName to name of r as string
          if rName is "missing value" then set rName to ""
        end try
        set rBody to ""
        try
          set rBody to body of r as string
          if rBody is "missing value" then set rBody to ""
        end try
        set rCompleted to "false"
        try
          set rCompleted to (completed of r) as string
        end try
        set rDue to ""
        try
          set rDue to (due date of r) as string
          if rDue is "missing value" then set rDue to ""
        end try
        set rAllDayDue to ""
        try
          set rAllDayDue to (allday due date of r) as string
          if rAllDayDue is "missing value" then set rAllDayDue to ""
        end try
        set rRemind to ""
        try
          set rRemind to (remind me date of r) as string
          if rRemind is "missing value" then set rRemind to ""
        end try
        set rPriority to "0"
        try
          set rPriority to (priority of r) as string
        end try
        set rFlagged to "false"
        try
          set rFlagged to (flagged of r) as string
        end try
        set output to output & rId & "${FIELD_SEP}" & rName & "${FIELD_SEP}" & rBody & "${FIELD_SEP}" & rCompleted & "${FIELD_SEP}" & rDue & "${FIELD_SEP}" & rAllDayDue & "${FIELD_SEP}" & rRemind & "${FIELD_SEP}" & rPriority & "${FIELD_SEP}" & rFlagged & "${FIELD_SEP}" & ${listExpr} & "${RECORD_SEP}"`;
}

export const REMINDER_RECORD_FIELDS = [
  "id",
  "name",
  "body",
  "completed",
  "dueDate",
  "allDayDueDate",
  "remindMeDate",
  "priority",
  "flagged",
  "list",
] as const;

export interface ReminderRecord {
  id: string;
  name: string;
  body: string;
  completed: boolean;
  dueDate: string;
  allDayDueDate: string;
  remindMeDate: string;
  priority: number;
  flagged: boolean;
  list: string;
}

export function coerceReminderRecord(r: Record<string, string>): ReminderRecord {
  return {
    id: r.id ?? "",
    name: r.name ?? "",
    body: r.body ?? "",
    completed: r.completed === "true",
    dueDate: r.dueDate ?? "",
    allDayDueDate: r.allDayDueDate ?? "",
    remindMeDate: r.remindMeDate ?? "",
    priority: parseInt(r.priority || "0", 10) || 0,
    flagged: r.flagged === "true",
    list: r.list ?? "",
  };
}
