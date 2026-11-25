import { readFileSync, writeFileSync } from "node:fs";

const catalog = JSON.parse(readFileSync(new URL("../data/places.json", import.meta.url), "utf8"));

function sql(value) {
  if (value == null) return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function tags(list) {
  if (!list?.length) return "'{}'::text[]";
  return `array[${list.map((tag) => sql(tag)).join(", ")}]::text[]`;
}

const slugs = catalog.places.map((place) => sql(place.slug)).join(", ");
const placeRows = catalog.places
  .map(
    (place) => `(${[
      sql(place.slug),
      sql(place.name),
      sql(place.kind),
      sql(place.address),
      sql(place.neighborhood),
      sql(place.city),
      sql(place.state),
      sql(place.postalCode),
      place.lat,
      place.lng,
      sql(place.geoPrecision),
      sql(place.geoNote),
      sql(place.phone),
      sql(place.website),
      sql(place.instagram),
      tags(place.tags),
      sql(place.sourceUrl),
      sql(place.sourceLabel),
      sql(place.scheduleStatus),
      place.lastConfirmedAt ? `${sql(place.lastConfirmedAt)}::date` : "null",
      sql(place.notes),
    ].join(", ")})`,
  )
  .join(",\n");

const scheduleRows = [];
for (const place of catalog.places) {
  for (const item of place.schedules) {
    scheduleRows.push(`((select id from public.places where slug = ${sql(place.slug)}), ${item.weekday}, ${sql(item.time)}::time, ${item.endTime ? `${sql(item.endTime)}::time` : "null"}, ${sql(item.type)}, ${sql(item.notes)}, ${item.weekOfMonth ?? "null"})`);
  }
}

const sqlText = `-- Gerado de data/places.json por scripts/generate-seed.mjs.
-- Pode ser executado de novo: atualiza as fichas e recria os horários destas comunidades.
begin;

insert into public.places (
  slug, name, kind, address, neighborhood, city, state, postal_code,
  lat, lng, geo_precision, geo_note, phone, website, instagram, tags,
  source_url, source_label, schedule_status, last_confirmed_at, notes
) values
${placeRows}
on conflict (slug) do update set
  name = excluded.name,
  kind = excluded.kind,
  address = excluded.address,
  neighborhood = excluded.neighborhood,
  city = excluded.city,
  state = excluded.state,
  postal_code = excluded.postal_code,
  lat = excluded.lat,
  lng = excluded.lng,
  geo_precision = excluded.geo_precision,
  geo_note = excluded.geo_note,
  phone = excluded.phone,
  website = excluded.website,
  instagram = excluded.instagram,
  tags = excluded.tags,
  source_url = excluded.source_url,
  source_label = excluded.source_label,
  schedule_status = excluded.schedule_status,
  last_confirmed_at = excluded.last_confirmed_at,
  notes = excluded.notes;

delete from public.schedules
where place_id in (select id from public.places where slug in (${slugs}));

insert into public.schedules (
  place_id, weekday, starts_at, ends_at, celebration_type, notes, week_of_month
) values
${scheduleRows.join(",\n")};

commit;
`;

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sqlText);
console.log(`seed.sql: ${catalog.places.length} lugares, ${scheduleRows.length} horários`);
