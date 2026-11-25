import "server-only";

import { cache } from "react";
import catalogJson from "../../data/places.json";
import { getSupabase } from "./supabase";
import type {
  Catalog,
  CelebrationType,
  DataSource,
  GeoPrecision,
  Place,
  PlaceKind,
  Schedule,
  ScheduleStatus,
} from "./types";

const localCatalog = catalogJson as Catalog;

function asSchedule(row: Record<string, unknown>): Schedule | null {
  const weekday = Number(row.weekday);
  const time = String(row.starts_at ?? "").slice(0, 5);
  const type = String(row.celebration_type ?? "");
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) return null;
  if (!/^\d{2}:\d{2}$/.test(time)) return null;
  if (type !== "missa" && type !== "confissao" && type !== "adoracao") return null;
  const end = row.ends_at ? String(row.ends_at).slice(0, 5) : null;
  const week = row.week_of_month == null ? null : Number(row.week_of_month);
  return {
    weekday,
    time,
    endTime: end && /^\d{2}:\d{2}$/.test(end) ? end : null,
    type: type as CelebrationType,
    notes: row.notes ? String(row.notes) : null,
    weekOfMonth: week != null && Number.isFinite(week) ? week : null,
  };
}

function asPlace(row: Record<string, unknown>): Place | null {
  if (!row.slug || !row.name || row.lat == null || row.lng == null) return null;
  const schedulesRaw = Array.isArray(row.schedules) ? row.schedules : [];
  const schedules = schedulesRaw
    .map((item) => asSchedule(item as Record<string, unknown>))
    .filter((item): item is Schedule => item != null);
  const kind = String(row.kind) as PlaceKind;
  const status = String(row.schedule_status) as ScheduleStatus;
  const precision = String(row.geo_precision) as GeoPrecision;
  return {
    slug: String(row.slug),
    name: String(row.name),
    kind,
    address: String(row.address ?? ""),
    neighborhood: String(row.neighborhood ?? ""),
    city: String(row.city ?? "Londrina"),
    state: String(row.state ?? "PR"),
    postalCode: row.postal_code ? String(row.postal_code) : null,
    lat: Number(row.lat),
    lng: Number(row.lng),
    geoPrecision: precision === "edificio" ? "edificio" : "via",
    geoNote: row.geo_note ? String(row.geo_note) : null,
    phone: row.phone ? String(row.phone) : null,
    website: row.website ? String(row.website) : null,
    instagram: row.instagram ? String(row.instagram) : null,
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    sourceUrl: String(row.source_url ?? ""),
    sourceLabel: String(row.source_label ?? "Fonte"),
    scheduleStatus:
      status === "confirmado" || status === "parcial" || status === "a_confirmar"
        ? status
        : "a_confirmar",
    lastConfirmedAt: row.last_confirmed_at
      ? String(row.last_confirmed_at).slice(0, 10)
      : null,
    notes: row.notes ? String(row.notes) : null,
    schedules,
  };
}

async function readSupabasePlaces(): Promise<Place[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("places")
    .select(
      "slug,name,kind,address,neighborhood,city,state,postal_code,lat,lng,geo_precision,geo_note,phone,website,instagram,tags,source_url,source_label,schedule_status,last_confirmed_at,notes,schedules(weekday,starts_at,ends_at,celebration_type,notes,week_of_month)",
    )
    .order("name");
  if (error || !data || data.length === 0) return null;
  const places = data
    .map((row) => asPlace(row as Record<string, unknown>))
    .filter((place): place is Place => place != null);
  return places.length > 0 ? places : null;
}

export const loadCatalog = cache(async (): Promise<{
  places: Place[];
  source: DataSource;
  center: Catalog["center"];
  updatedAt: string;
}> => {
  try {
    const remote = await readSupabasePlaces();
    if (remote) {
      return {
        places: remote,
        source: "supabase",
        center: localCatalog.center,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
    }
  } catch {
    // The local file keeps the site usable when the project has no rows yet.
  }
  return {
    places: localCatalog.places,
    source: "local",
    center: localCatalog.center,
    updatedAt: localCatalog.updatedAt,
  };
});

export async function loadPlace(slug: string): Promise<{
  place: Place | null;
  source: DataSource;
}> {
  const catalog = await loadCatalog();
  return {
    place: catalog.places.find((place) => place.slug === slug) ?? null,
    source: catalog.source,
  };
}

export function localSlugs(): string[] {
  return localCatalog.places.map((place) => place.slug);
}
