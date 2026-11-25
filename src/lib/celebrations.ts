import { haversineKm } from "./geo";
import { TYPE_LABEL } from "./format";
import { calendarDate, occurrenceOnDate, zonedParts } from "./schedule";
import type { CelebrationType, Origin, Place, Schedule } from "./types";

export type DayMode = "proximas" | "hoje" | "amanha" | "data";
export type TimeWindow = "qualquer" | "manha" | "tarde" | "noite";

export type CelebrationRow = {
  key: string;
  place: Place;
  schedule: Schedule;
  occursAt: Date;
  past: boolean;
  distanceKm: number;
  year: number;
  month: number;
  day: number;
};

export type UnconfirmedPlace = {
  place: Place;
  distanceKm: number;
};

const TYPE_TAG: Record<CelebrationType, string> = {
  missa: "Missa",
  confissao: "Confissão",
  adoracao: "Adoração",
};

export function inTimeWindow(time: string, window: TimeWindow): boolean {
  if (window === "qualquer") return true;
  const [hour, minute] = time.split(":").map(Number);
  const minutes = hour * 60 + minute;
  if (window === "manha") return minutes >= 5 * 60 && minutes < 12 * 60;
  if (window === "tarde") return minutes >= 12 * 60 && minutes < 18 * 60;
  return minutes >= 18 * 60;
}

export function matchesText(place: Place, query: string): boolean {
  const needle = query.trim().toLocaleLowerCase("pt-BR");
  if (!needle) return true;
  const haystack = `${place.name} ${place.neighborhood} ${place.address} ${place.tags.join(" ")}`.toLocaleLowerCase(
    "pt-BR",
  );
  return haystack.includes(needle);
}

export function matchesTags(place: Place, tags: string[]): boolean {
  return tags.every((tag) => place.tags.includes(tag));
}

function dateForMode(mode: DayMode, now: Date, selectedDate: string) {
  if (mode === "hoje") return calendarDate(now, 0);
  if (mode === "amanha") return calendarDate(now, 1);
  if (mode === "data" && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
    const [year, month, day] = selectedDate.split("-").map(Number);
    return { year, month, day };
  }
  return null;
}

export function buildCelebrations(input: {
  places: Place[];
  origin: Origin;
  now: Date;
  mode: DayMode;
  selectedDate: string;
  type: CelebrationType | "todas";
  window: TimeWindow;
  tags: string[];
  query: string;
}): { rows: CelebrationRow[]; unconfirmed: UnconfirmedPlace[] } {
  const target = dateForMode(input.mode, input.now, input.selectedDate);
  const rows: CelebrationRow[] = [];

  for (const place of input.places) {
    if (!matchesText(place, input.query) || !matchesTags(place, input.tags)) {
      continue;
    }
    const distanceKm = haversineKm(input.origin, place);
    for (const schedule of place.schedules) {
      if (input.type !== "todas" && schedule.type !== input.type) continue;
      if (!inTimeWindow(schedule.time, input.window)) continue;

      let occursAt: Date | null = null;
      if (target) {
        occursAt = occurrenceOnDate(
          schedule,
          target.year,
          target.month,
          target.day,
        );
      } else {
        for (let offset = 0; offset < 7; offset += 1) {
          const date = calendarDate(input.now, offset);
          const candidate = occurrenceOnDate(
            schedule,
            date.year,
            date.month,
            date.day,
          );
          if (!candidate || candidate.getTime() < input.now.getTime()) continue;
          occursAt = candidate;
          break;
        }
      }
      if (!occursAt) continue;
      const when = zonedParts(occursAt);
      rows.push({
        key: `${place.slug}-${schedule.type}-${schedule.weekday}-${schedule.time}-${schedule.weekOfMonth ?? "s"}`,
        place,
        schedule,
        occursAt,
        past: occursAt.getTime() < input.now.getTime(),
        distanceKm,
        year: when.year,
        month: when.month,
        day: when.day,
      });
    }
  }

  rows.sort((a, b) => {
    if (a.past !== b.past) return a.past ? 1 : -1;
    const timeDiff = a.occursAt.getTime() - b.occursAt.getTime();
    if (timeDiff !== 0) return timeDiff;
    return a.distanceKm - b.distanceKm;
  });

  const unconfirmed: UnconfirmedPlace[] = [];
  const showUnconfirmed =
    input.window === "qualquer" && input.mode !== "data";
  if (showUnconfirmed) {
    for (const place of input.places) {
      if (!matchesText(place, input.query) || !matchesTags(place, input.tags)) {
        continue;
      }
      const wantedTag = input.type === "todas" ? null : TYPE_TAG[input.type];
      const hasSchedule =
        input.type === "todas"
          ? place.schedules.length > 0
          : place.schedules.some((item) => item.type === input.type);
      const offers =
        wantedTag == null ? place.tags.includes("Missa") : place.tags.includes(wantedTag);
      if (hasSchedule || !offers) continue;
      unconfirmed.push({
        place,
        distanceKm: haversineKm(input.origin, place),
      });
    }
    unconfirmed.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  return { rows, unconfirmed };
}

export function typeLabel(type: CelebrationType): string {
  return TYPE_LABEL[type];
}
