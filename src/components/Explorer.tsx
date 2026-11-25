"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  buildCelebrations,
  type DayMode,
  type TimeWindow,
} from "@/lib/celebrations";
import { centroid } from "@/lib/geo";
import {
  TYPE_LABEL,
  formatClockRange,
  formatKm,
  formatLongDate,
  formatRelative,
} from "@/lib/format";
import { calendarDate, zonedParts } from "@/lib/schedule";
import type { CelebrationType, DataSource, Origin, Place } from "@/lib/types";
import type { MapMarker } from "./PlaceMap";

const PlaceMap = dynamic(
  () => import("./PlaceMap").then((mod) => mod.PlaceMap),
  {
    ssr: false,
    loading: () => (
      <p className="grid h-[70vh] min-h-[28rem] place-items-center rounded-3xl border border-line bg-paper text-lg">
        Abrindo o mapa…
      </p>
    ),
  },
);

const TAGS = ["Missa", "Confissão", "Adoração", "Acessível", "Estacionamento"];
const TYPES: Array<CelebrationType | "todas"> = [
  "todas",
  "missa",
  "confissao",
  "adoracao",
];

export function Explorer({
  places,
  center,
  generatedAt,
  source,
}: {
  places: Place[];
  center: Origin;
  generatedAt: string;
  source: DataSource;
}) {
  const [now, setNow] = useState(() => new Date(generatedAt));
  const [view, setView] = useState<"lista" | "mapa">("lista");
  const [mode, setMode] = useState<DayMode>("proximas");
  const [selectedDate, setSelectedDate] = useState("");
  const [type, setType] = useState<CelebrationType | "todas">("todas");
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("qualquer");
  const [tags, setTags] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [originKey, setOriginKey] = useState("centro");
  const [gps, setGps] = useState<Origin | null>(null);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const neighborhoods = useMemo(() => {
    return [...new Set(places.map((place) => place.neighborhood))].sort((a, b) =>
      a.localeCompare(b, "pt-BR"),
    );
  }, [places]);

  const origin = useMemo<Origin>(() => {
    if (originKey === "gps" && gps) return gps;
    if (originKey !== "centro" && originKey !== "gps") {
      const group = places.filter((place) => place.neighborhood === originKey);
      const point = centroid(group);
      if (point) {
        return { ...point, label: originKey };
      }
    }
    return center;
  }, [originKey, gps, places, center]);

  const { rows, unconfirmed } = useMemo(
    () =>
      buildCelebrations({
        places,
        origin,
        now,
        mode,
        selectedDate,
        type,
        window: timeWindow,
        tags,
        query,
      }),
    [places, origin, now, mode, selectedDate, type, timeWindow, tags, query],
  );

  const today = zonedParts(now);
  const groups = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = `${row.year}-${row.month}-${row.day}`;
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }

  const markers: MapMarker[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    if (seen.has(row.place.slug)) continue;
    seen.add(row.place.slug);
    markers.push({
      slug: row.place.slug,
      name: row.place.name,
      neighborhood: row.place.neighborhood,
      lat: row.place.lat,
      lng: row.place.lng,
      distanceLabel: formatKm(row.distanceKm),
      summary: `${TYPE_LABEL[row.schedule.type]} ${formatClockRange(row.schedule.time, row.schedule.endTime)}`,
    });
  }
  for (const item of unconfirmed) {
    if (seen.has(item.place.slug)) continue;
    markers.push({
      slug: item.place.slug,
      name: item.place.name,
      neighborhood: item.place.neighborhood,
      lat: item.place.lat,
      lng: item.place.lng,
      distanceLabel: formatKm(item.distanceKm),
      summary: "Horário a confirmar",
    });
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setGpsMessage("Este navegador não oferece localização. Usando o centro de Londrina.");
      setOriginKey("centro");
      return;
    }
    setLocating(true);
    setGpsMessage(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGps({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: "sua localização",
        });
        setOriginKey("gps");
        setLocating(false);
      },
      () => {
        setLocating(false);
        setOriginKey("centro");
        setGpsMessage(
          "Não foi possível usar o GPS. As distâncias seguem o centro de Londrina. Você pode escolher um bairro.",
        );
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 },
    );
  }

  function toggleTag(tag: string) {
    setTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  }

  function headingFor(year: number, month: number, day: number) {
    const label = formatLongDate(year, month, day);
    if (year === today.year && month === today.month && day === today.day) {
      return `Hoje · ${label}`;
    }
    const next = calendarDate(now, 1);
    if (year === next.year && month === next.month && day === next.day) {
      return `Amanhã · ${label}`;
    }
    return label;
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] bg-navy px-5 py-8 text-ivory sm:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-gold-bright">
          Londrina, Paraná
        </p>
        <h1 className="mt-2 max-w-3xl font-serif text-5xl text-white sm:text-6xl">
          Onde é a próxima celebração?
        </h1>
        <p className="mt-4 max-w-2xl text-xl text-gold-bright">
          Missa, confissão e adoração em paróquias e capelas, da que começa
          primeiro para a mais distante. A localização fica só neste aparelho.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={useMyLocation}
            className="min-h-14 rounded-full bg-gold-bright px-6 text-lg font-bold text-navy"
          >
            {locating ? "Buscando localização…" : "Usar minha localização"}
          </button>
          <label className="grid min-h-14 flex-1 gap-1 text-sm font-bold text-gold-bright">
            Calcular a partir do bairro
            <select
              value={originKey === "gps" ? "gps" : originKey}
              onChange={(event) => {
                setOriginKey(event.target.value);
                setGpsMessage(null);
              }}
              className="min-h-14 rounded-full border-0 bg-white px-4 text-lg text-navy"
            >
              <option value="centro">Centro de Londrina</option>
              {originKey === "gps" ? (
                <option value="gps">Minha localização</option>
              ) : null}
              {neighborhoods.map((neighborhood) => (
                <option key={neighborhood} value={neighborhood}>
                  {neighborhood}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-4 text-base text-white">
          Distâncias a partir de {origin.label}.{" "}
          {source === "supabase"
            ? "Horários lidos do banco publicado."
            : "Horários do arquivo local, enquanto o banco não tem registros."}
        </p>
        {gpsMessage ? (
          <p role="status" className="mt-3 rounded-2xl bg-white/10 px-4 py-3">
            {gpsMessage}
          </p>
        ) : null}
      </section>

      <section aria-label="Filtros" className="grid gap-4 rounded-[2rem] border border-line bg-paper p-4 sm:p-6">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Dia">
          {(
            [
              ["proximas", "Próximas"],
              ["hoje", "Hoje"],
              ["amanha", "Amanhã"],
              ["data", "Escolher dia"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={`min-h-12 rounded-full px-4 font-bold ${
                mode === value ? "bg-navy text-white" : "bg-ivory text-navy"
              }`}
            >
              {label}
            </button>
          ))}
          {mode === "data" ? (
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="min-h-12 rounded-full border border-line bg-white px-4"
              aria-label="Escolher o dia"
            />
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Tipo">
          {TYPES.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={type === value}
              onClick={() => setType(value)}
              className={`min-h-12 rounded-full px-4 font-bold ${
                type === value ? "bg-navy text-white" : "bg-ivory text-navy"
              }`}
            >
              {value === "todas" ? "Tudo" : TYPE_LABEL[value]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Período">
          {(
            [
              ["qualquer", "Qualquer hora"],
              ["manha", "Manhã"],
              ["tarde", "Tarde"],
              ["noite", "Noite"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={timeWindow === value}
              onClick={() => setTimeWindow(value)}
              className={`min-h-12 rounded-full px-4 font-bold ${
                timeWindow === value ? "bg-gold text-white" : "bg-ivory text-navy"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Etiquetas">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              aria-pressed={tags.includes(tag)}
              onClick={() => toggleTag(tag)}
              className={`min-h-12 rounded-full border px-4 font-bold ${
                tags.includes(tag)
                  ? "border-navy bg-navy text-white"
                  : "border-line bg-white text-navy"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <label className="grid gap-1 font-bold">
          Buscar nome, bairro ou endereço
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-h-14 rounded-2xl border border-line bg-white px-4 text-lg font-normal"
            placeholder="Ex.: Centro, Sant'Ana, Higienópolis"
          />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted">
            {rows.length} {rows.length === 1 ? "celebração" : "celebrações"}
            {mode === "proximas" ? " nos próximos 7 dias" : ""}
          </p>
          <div className="flex rounded-full bg-ivory p-1" role="group" aria-label="Modo de exibição">
            <button
              type="button"
              aria-pressed={view === "lista"}
              onClick={() => setView("lista")}
              className={`min-h-12 rounded-full px-5 font-bold ${view === "lista" ? "bg-navy text-white" : "text-navy"}`}
            >
              Lista
            </button>
            <button
              type="button"
              aria-pressed={view === "mapa"}
              onClick={() => setView("mapa")}
              className={`min-h-12 rounded-full px-5 font-bold ${view === "mapa" ? "bg-navy text-white" : "text-navy"}`}
            >
              Mapa
            </button>
          </div>
        </div>
      </section>

      {view === "mapa" ? (
        <PlaceMap markers={markers} origin={origin} />
      ) : (
        <div className="grid gap-8">
          {rows.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-line bg-paper px-5 py-8 text-xl">
              Nenhuma celebração com esses filtros. Limpe a busca ou escolha outro dia.
            </p>
          ) : null}
          {[...groups.entries()].map(([key, items]) => (
            <section key={key} className="grid gap-3">
              <h2 className="font-serif text-4xl text-navy">
                {headingFor(items[0].year, items[0].month, items[0].day)}
              </h2>
              <ul className="grid gap-3">
                {items.map((row) => {
                  const relative = formatRelative(now, row.occursAt);
                  return (
                    <li key={row.key}>
                      <Link
                        href={`/paroquia/${row.place.slug}`}
                        className="grid gap-3 rounded-3xl border border-line bg-paper p-4 hover:border-navy sm:grid-cols-[12.5rem_1fr] sm:items-center sm:p-5"
                      >
                        <p className={`whitespace-nowrap font-serif text-5xl leading-none ${row.past ? "text-muted" : "text-navy"}`}>
                          {formatClockRange(row.schedule.time, row.schedule.endTime)}
                        </p>
                        <div>
                          <p className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-navy px-3 py-1 text-sm font-bold text-white">
                              {TYPE_LABEL[row.schedule.type]}
                            </span>
                            <span className="rounded-full bg-gold-bright px-3 py-1 text-sm font-bold text-navy">
                              <span className="sr-only">{relative.accessible}. </span>
                              <span aria-hidden>{relative.label}</span>
                            </span>
                            <span className="text-muted">{formatKm(row.distanceKm)}</span>
                          </p>
                          <p className="mt-2 font-serif text-3xl text-navy">{row.place.name}</p>
                          <p className="text-muted">
                            {row.place.neighborhood}
                            {row.schedule.notes ? ` · ${row.schedule.notes}` : ""}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          {unconfirmed.length > 0 ? (
            <section className="grid gap-3">
              <h2 className="font-serif text-4xl text-navy">Horário a confirmar</h2>
              <p className="text-muted">
                Estes lugares existem e estão no mapa, mas a grade ainda não foi
                publicada de forma segura o bastante para entrar na lista por horário.
              </p>
              <ul className="grid gap-3">
                {unconfirmed.map((item) => (
                  <li key={item.place.slug}>
                    <Link
                      href={`/paroquia/${item.place.slug}`}
                      className="block rounded-3xl border border-dashed border-line bg-paper p-5"
                    >
                      <p className="font-serif text-3xl text-navy">{item.place.name}</p>
                      <p className="text-muted">
                        {item.place.neighborhood} · {formatKm(item.distanceKm)} · a confirmar
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
