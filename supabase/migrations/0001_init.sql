-- Bússola Católica — esquema inicial.
-- Rode este arquivo no SQL Editor do Supabase (ou via CLI) antes do seed.
-- Leitura pública de lugares e horários. Sugestões: só inserção anônima.

create table public.places (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  kind text not null,
  address text not null,
  neighborhood text not null,
  city text not null default 'Londrina',
  state text not null default 'PR',
  postal_code text,
  lat double precision not null,
  lng double precision not null,
  geo_precision text not null default 'via',
  geo_note text,
  phone text,
  website text,
  instagram text,
  tags text[] not null default '{}',
  source_url text not null,
  source_label text not null,
  schedule_status text not null,
  last_confirmed_at date,
  notes text,
  created_at timestamptz not null default now(),
  constraint places_kind_check check (kind in ('catedral', 'paroquia', 'santuario', 'capela')),
  constraint places_status_check check (schedule_status in ('confirmado', 'parcial', 'a_confirmar')),
  constraint places_precision_check check (geo_precision in ('edificio', 'via')),
  constraint places_lat_check check (lat between -24 and -23),
  constraint places_lng_check check (lng between -52 and -51)
);

create table public.schedules (
  id bigint generated always as identity primary key,
  place_id bigint not null references public.places (id) on delete cascade,
  weekday smallint not null,
  starts_at time not null,
  ends_at time,
  celebration_type text not null,
  notes text,
  week_of_month smallint,
  created_at timestamptz not null default now(),
  constraint schedules_weekday_check check (weekday between 0 and 6),
  constraint schedules_type_check check (celebration_type in ('missa', 'confissao', 'adoracao')),
  constraint schedules_week_check check (week_of_month is null or week_of_month between 1 and 5),
  constraint schedules_end_check check (ends_at is null or ends_at > starts_at)
);

comment on column public.schedules.weekday is '0 = domingo … 6 = sábado, no fuso America/Sao_Paulo.';

create index schedules_place_id_idx on public.schedules (place_id);
create index schedules_weekday_starts_idx on public.schedules (weekday, starts_at);
create index places_neighborhood_idx on public.places (neighborhood);

create table public.suggestions (
  id bigint generated always as identity primary key,
  place_slug text,
  author_name text,
  contact text,
  message text not null,
  created_at timestamptz not null default now(),
  constraint suggestions_message_len check (char_length(message) between 10 and 2000),
  constraint suggestions_name_len check (author_name is null or char_length(author_name) <= 120),
  constraint suggestions_contact_len check (contact is null or char_length(contact) <= 160),
  constraint suggestions_slug_len check (place_slug is null or char_length(place_slug) <= 80)
);

create index suggestions_created_at_idx on public.suggestions (created_at desc);

alter table public.places enable row level security;
alter table public.schedules enable row level security;
alter table public.suggestions enable row level security;

create policy places_select_public
  on public.places
  for select
  to anon, authenticated
  using (true);

create policy schedules_select_public
  on public.schedules
  for select
  to anon, authenticated
  using (true);

create policy suggestions_insert_public
  on public.suggestions
  for insert
  to anon, authenticated
  with check (char_length(message) between 10 and 2000);

revoke all on table public.places from anon, authenticated;
revoke all on table public.schedules from anon, authenticated;
revoke all on table public.suggestions from anon, authenticated;

grant select on table public.places to anon, authenticated;
grant select on table public.schedules to anon, authenticated;
grant insert on table public.suggestions to anon, authenticated;
grant usage, select on sequence public.suggestions_id_seq to anon, authenticated;
