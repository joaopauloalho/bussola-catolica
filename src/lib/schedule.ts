import type { Schedule } from "./types";
import { TIMEZONE } from "./types";

export type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: number;
};

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function zonedParts(date: Date): ZonedParts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  });
  const bag: Record<string, string> = {};
  for (const part of fmt.formatToParts(date)) {
    if (part.type !== "literal") bag[part.type] = part.value;
  }
  let hour = Number(bag.hour);
  if (hour === 24) hour = 0;
  return {
    year: Number(bag.year),
    month: Number(bag.month),
    day: Number(bag.day),
    hour,
    minute: Number(bag.minute),
    weekday: WEEKDAY_INDEX[bag.weekday] ?? 0,
  };
}

export function weekdayOf(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function addCalendarDays(
  year: number,
  month: number,
  day: number,
  amount: number,
) {
  const next = new Date(Date.UTC(year, month - 1, day + amount));
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  };
}

export function weekOfMonth(day: number): number {
  return Math.floor((day - 1) / 7) + 1;
}

/** Convert a wall-clock time in America/Sao_Paulo to a UTC Date. */
export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute);
  const parts = zonedParts(new Date(utcGuess));
  const got = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
  );
  const wanted = Date.UTC(year, month - 1, day, hour, minute);
  return new Date(utcGuess - (got - wanted));
}

export function parseTime(value: string): { hour: number; minute: number } {
  const [hour, minute] = value.split(":");
  return { hour: Number(hour), minute: Number(minute) };
}

export function occurrenceOnDate(
  schedule: Pick<Schedule, "weekday" | "time" | "weekOfMonth">,
  year: number,
  month: number,
  day: number,
): Date | null {
  if (weekdayOf(year, month, day) !== schedule.weekday) return null;
  if (
    schedule.weekOfMonth != null &&
    weekOfMonth(day) !== schedule.weekOfMonth
  ) {
    return null;
  }
  const { hour, minute } = parseTime(schedule.time);
  return zonedTimeToUtc(year, month, day, hour, minute);
}

/** Soonest occurrence at or after `from`, within `horizonDays` calendar days. */
export function nextOccurrence(
  schedule: Pick<Schedule, "weekday" | "time" | "weekOfMonth">,
  from: Date,
  horizonDays = 40,
): Date | null {
  const start = zonedParts(from);
  for (let offset = 0; offset <= horizonDays; offset += 1) {
    const date = addCalendarDays(start.year, start.month, start.day, offset);
    const at = occurrenceOnDate(schedule, date.year, date.month, date.day);
    if (!at) continue;
    if (at.getTime() >= from.getTime()) return at;
  }
  return null;
}

export function calendarDate(from: Date, dayOffset = 0) {
  const parts = zonedParts(from);
  return addCalendarDays(parts.year, parts.month, parts.day, dayOffset);
}
