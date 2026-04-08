#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { listCalendars } from "./tools/listCalendars.js";
import { getCalendar } from "./tools/getCalendar.js";
import { createCalendar } from "./tools/createCalendar.js";
import { updateCalendar } from "./tools/updateCalendar.js";
import { deleteCalendar } from "./tools/deleteCalendar.js";
import { switchView } from "./tools/switchView.js";
import { reloadCalendars } from "./tools/reloadCalendars.js";
import { listEvents } from "./tools/listEvents.js";
import { searchEvents } from "./tools/searchEvents.js";
import { getEvent } from "./tools/getEvent.js";
import { createEvent } from "./tools/createEvent.js";
import { updateEvent } from "./tools/updateEvent.js";
import { deleteEvent } from "./tools/deleteEvent.js";
import { moveEvent } from "./tools/moveEvent.js";
import { duplicateEvent } from "./tools/duplicateEvent.js";
import { todayEvents } from "./tools/todayEvents.js";
import { upcomingEvents } from "./tools/upcomingEvents.js";
import { listAttendees } from "./tools/listAttendees.js";
import { addAttendee } from "./tools/addAttendee.js";
import { removeAttendee } from "./tools/removeAttendee.js";
import { listAlarms } from "./tools/listAlarms.js";
import { addDisplayAlarm } from "./tools/addDisplayAlarm.js";
import { addSoundAlarm } from "./tools/addSoundAlarm.js";
import { addMailAlarm } from "./tools/addMailAlarm.js";
import { removeAlarm } from "./tools/removeAlarm.js";

const server = new McpServer({
  name: "calendarmcp",
  version: "0.1.0",
});

server.tool(
  "list-calendars",
  "List all calendars in macOS Calendar.app with name, writable flag, and description (calendars are identified by name; Calendar.app exposes no usable id)",
  {},
  async () => {
    const calendars = await listCalendars();
    return { content: [{ type: "text", text: JSON.stringify(calendars, null, 2) }] };
  },
);

server.tool(
  "get-calendar",
  "Get properties of a single calendar by name",
  {
    name: z.string().describe("Calendar name"),
  },
  async ({ name }) => {
    const cal = await getCalendar(name);
    if (!cal) return { content: [{ type: "text", text: "Calendar not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(cal, null, 2) }] };
  },
);

server.tool(
  "create-calendar",
  "Create a new calendar in macOS Calendar.app",
  {
    name: z.string().describe("Name for the new calendar"),
    description: z.string().optional().describe("Calendar description"),
  },
  async ({ name, description }) => {
    const result = await createCalendar(name, description);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "update-calendar",
  "Rename a calendar or set its description",
  {
    name: z.string().describe("Current calendar name"),
    newName: z.string().optional().describe("New name for the calendar"),
    description: z.string().optional().describe("New description"),
  },
  async ({ name, newName, description }) => {
    const result = await updateCalendar(name, newName, description);
    if (!result) return { content: [{ type: "text", text: "Calendar not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "delete-calendar",
  "Check whether a calendar exists, then return an error explaining that Calendar.app does NOT support deleting calendars via AppleScript (returns -10000). Calendars must be removed from the Calendar.app UI manually.",
  {
    name: z.string().describe("Name of the calendar to delete"),
  },
  async ({ name }) => {
    try {
      const result = await deleteCalendar(name);
      if (!result) return { content: [{ type: "text", text: "Calendar not found." }] };
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (e) {
      return {
        content: [{ type: "text", text: (e as Error).message }],
        isError: true,
      };
    }
  },
);

server.tool(
  "switch-view",
  "Switch Calendar.app to day, week, or month view, optionally jumping to a specific date",
  {
    view: z.enum(["day", "week", "month"]).describe("View to switch to"),
    date: z.string().optional().describe("Optional ISO date to navigate to (e.g. 2026-04-07)"),
  },
  async ({ view, date }) => {
    const result = await switchView(view, date);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "reload-calendars",
  "Force Calendar.app to refresh / reload all calendars from their accounts",
  {},
  async () => {
    const result = await reloadCalendars();
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list-events",
  "List events in a calendar between two ISO dates",
  {
    calendarName: z.string().describe("Calendar name"),
    startDate: z.string().describe("Start of range, ISO 8601 (e.g. 2026-04-07T00:00:00)"),
    endDate: z.string().describe("End of range, ISO 8601"),
    limit: z.number().optional().default(100).describe("Max events to return"),
  },
  async ({ calendarName, startDate, endDate, limit }) => {
    const events = await listEvents(calendarName, startDate, endDate, limit);
    if (!events) return { content: [{ type: "text", text: "Calendar not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(events, null, 2) }] };
  },
);

server.tool(
  "search-events",
  "Search events by summary substring across one calendar or all calendars. Bounded by a date window (defaults: −30d to +365d) to stay under the osascript timeout.",
  {
    query: z.string().describe("Substring to match against event summaries"),
    calendarName: z.string().optional().describe("Optional calendar to scope the search"),
    limit: z.number().optional().default(25).describe("Max results to return"),
    since: z.string().optional().describe("ISO date — earliest start date (default: 30 days ago)"),
    until: z.string().optional().describe("ISO date — latest start date (default: 365 days from now)"),
  },
  async ({ query, calendarName, limit, since, until }) => {
    const events = await searchEvents(query, calendarName, limit, since, until);
    if (!events) return { content: [{ type: "text", text: "Calendar not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(events, null, 2) }] };
  },
);

server.tool(
  "get-event",
  "Get full details of an event by its uid (searches all calendars)",
  {
    uid: z.string().describe("Event uid"),
  },
  async ({ uid }) => {
    const event = await getEvent(uid);
    if (!event) return { content: [{ type: "text", text: "Event not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(event, null, 2) }] };
  },
);

server.tool(
  "create-event",
  "Create a new event in a named calendar",
  {
    calendarName: z.string().describe("Calendar to create the event in"),
    summary: z.string().describe("Event title / summary"),
    startDate: z.string().describe("Start date, ISO 8601"),
    endDate: z.string().describe("End date, ISO 8601"),
    allDay: z.boolean().optional().describe("All-day event flag"),
    location: z.string().optional().describe("Location"),
    description: z.string().optional().describe("Notes / description"),
    url: z.string().optional().describe("Associated URL"),
  },
  async ({ calendarName, summary, startDate, endDate, allDay, location, description, url }) => {
    const result = await createEvent(calendarName, summary, startDate, endDate, allDay, location, description, url);
    if (!result) return { content: [{ type: "text", text: "Calendar not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "update-event",
  "Patch fields on an existing event by uid",
  {
    uid: z.string().describe("Event uid"),
    summary: z.string().optional(),
    startDate: z.string().optional().describe("New start date, ISO 8601"),
    endDate: z.string().optional().describe("New end date, ISO 8601"),
    allDay: z.boolean().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    url: z.string().optional(),
  },
  async ({ uid, ...fields }) => {
    const result = await updateEvent(uid, fields);
    if (!result) return { content: [{ type: "text", text: "Event not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "delete-event",
  "Delete an event by uid",
  {
    uid: z.string().describe("Event uid"),
  },
  async ({ uid }) => {
    const result = await deleteEvent(uid);
    if (!result) return { content: [{ type: "text", text: "Event not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "move-event",
  "Move an event to a different calendar. AppleScript cannot reparent directly, so this deletes the original and recreates it in the target calendar (the new event has a fresh uid).",
  {
    uid: z.string().describe("Event uid"),
    targetCalendar: z.string().describe("Name of the destination calendar"),
  },
  async ({ uid, targetCalendar }) => {
    const result = await moveEvent(uid, targetCalendar);
    if (!result) return { content: [{ type: "text", text: "Event or target calendar not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "duplicate-event",
  "Duplicate an event into the same calendar or a different one",
  {
    uid: z.string().describe("Event uid to duplicate"),
    targetCalendar: z.string().optional().describe("Optional destination calendar (defaults to the source calendar)"),
  },
  async ({ uid, targetCalendar }) => {
    const result = await duplicateEvent(uid, targetCalendar);
    if (!result) return { content: [{ type: "text", text: "Event or target calendar not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "today-events",
  "List today's events in one calendar or across all calendars",
  {
    calendarName: z.string().optional().describe("Optional calendar to scope to"),
    limit: z.number().optional().default(100).describe("Max events to return"),
  },
  async ({ calendarName, limit }) => {
    const events = await todayEvents(calendarName, limit);
    if (!events) return { content: [{ type: "text", text: "Calendar not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(events, null, 2) }] };
  },
);

server.tool(
  "upcoming-events",
  "List events in the next N days in one calendar or across all calendars",
  {
    days: z.number().optional().default(7).describe("Number of days ahead"),
    calendarName: z.string().optional().describe("Optional calendar to scope to"),
    limit: z.number().optional().default(100).describe("Max events to return"),
  },
  async ({ days, calendarName, limit }) => {
    const events = await upcomingEvents(days, calendarName, limit);
    if (!events) return { content: [{ type: "text", text: "Calendar not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(events, null, 2) }] };
  },
);

server.tool(
  "list-attendees",
  "List attendees on an event by uid",
  {
    uid: z.string().describe("Event uid"),
  },
  async ({ uid }) => {
    const result = await listAttendees(uid);
    if (!result) return { content: [{ type: "text", text: "Event not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "add-attendee",
  "Add an attendee to an event by uid",
  {
    uid: z.string().describe("Event uid"),
    email: z.string().describe("Attendee email"),
    displayName: z.string().optional().describe("Optional display name"),
  },
  async ({ uid, email, displayName }) => {
    const result = await addAttendee(uid, email, displayName);
    if (!result) return { content: [{ type: "text", text: "Event not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "remove-attendee",
  "Remove an attendee from an event by email",
  {
    uid: z.string().describe("Event uid"),
    email: z.string().describe("Attendee email to remove"),
  },
  async ({ uid, email }) => {
    const result = await removeAttendee(uid, email);
    if (!result) return { content: [{ type: "text", text: "Event not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "list-alarms",
  "List display, mail, and sound alarms on an event with their trigger interval (minutes relative to start)",
  {
    uid: z.string().describe("Event uid"),
  },
  async ({ uid }) => {
    const result = await listAlarms(uid);
    if (!result) return { content: [{ type: "text", text: "Event not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "add-display-alarm",
  "Add a display alarm to an event firing N minutes before its start",
  {
    uid: z.string().describe("Event uid"),
    minutesBefore: z.number().describe("Minutes before event start to fire the alarm"),
  },
  async ({ uid, minutesBefore }) => {
    const result = await addDisplayAlarm(uid, minutesBefore);
    if (!result) return { content: [{ type: "text", text: "Event not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "add-sound-alarm",
  "Add a sound alarm to an event firing N minutes before its start",
  {
    uid: z.string().describe("Event uid"),
    minutesBefore: z.number().describe("Minutes before event start to fire the alarm"),
    soundName: z.string().describe("System sound name (e.g. 'Basso', 'Glass', 'Ping')"),
  },
  async ({ uid, minutesBefore, soundName }) => {
    const result = await addSoundAlarm(uid, minutesBefore, soundName);
    if (!result) return { content: [{ type: "text", text: "Event not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "add-mail-alarm",
  "Add a mail alarm to an event firing N minutes before its start",
  {
    uid: z.string().describe("Event uid"),
    minutesBefore: z.number().describe("Minutes before event start to fire the alarm"),
  },
  async ({ uid, minutesBefore }) => {
    const result = await addMailAlarm(uid, minutesBefore);
    if (!result) return { content: [{ type: "text", text: "Event not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "remove-alarm",
  "Remove an alarm from an event by 1-based index within its combined display+mail+sound alarm list (matching list-alarms output)",
  {
    uid: z.string().describe("Event uid"),
    index: z.number().describe("1-based index of the alarm to remove"),
  },
  async ({ uid, index }) => {
    const result = await removeAlarm(uid, index);
    if (!result) return { content: [{ type: "text", text: "Event not found." }] };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
