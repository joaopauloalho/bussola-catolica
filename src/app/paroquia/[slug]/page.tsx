import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DistanceNote } from "@/components/DistanceNote";
import { ParishMap } from "@/components/ParishMap";
import { SuggestionForm } from "@/components/SuggestionForm";
import { mapsDirectionsUrl, telHref, wazeUrl } from "@/lib/geo";
import {
  KIND_LABEL,
  STATUS_LABEL,
  TYPE_LABEL,
  WEEKDAY_LONG,
  formatClockRange,
  formatConfirmedDate,
} from "@/lib/format";
import { loadCatalog, loadPlace, localSlugs } from "@/lib/places";
import { siteUrl } from "@/lib/site";
import type { Schedule } from "@/lib/types";

export const revalidate = 3600;

type Params = { slug: string };

export function generateStaticParams() {
  return localSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { place } = await loadPlace(slug);
  if (!place) return { title: "Paróquia não encontrada" };
  const description = `${place.address}, ${place.neighborhood}, Londrina. ${STATUS_LABEL[place.scheduleStatus]}. Fonte: ${place.sourceLabel}.`;
  return {
    title: place.name,
    description,
    alternates: { canonical: `/paroquia/${place.slug}` },
    openGraph: {
      title: place.name,
      description,
      url: `/paroquia/${place.slug}`,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "Bússola Católica" }],
    },
  };
}

function byWeekday(schedules: Schedule[]) {
  const groups = new Map<number, Schedule[]>();
  for (const schedule of schedules) {
    const list = groups.get(schedule.weekday) ?? [];
    list.push(schedule);
    groups.set(schedule.weekday, list);
  }
  return [...groups.entries()].sort((a, b) => a[0] - b[0]);
}

export default async function ParishPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const [{ place, source }, catalog] = await Promise.all([
    loadPlace(slug),
    loadCatalog(),
  ]);
  if (!place) notFound();
  const days = byWeekday(place.schedules);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CatholicChurch",
    name: place.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: place.address,
      addressLocality: "Londrina",
      addressRegion: "PR",
      postalCode: place.postalCode ?? undefined,
      addressCountry: "BR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: place.lat,
      longitude: place.lng,
    },
    telephone: place.phone ?? undefined,
    url: place.website ?? `${siteUrl()}/paroquia/${place.slug}`,
    sameAs: place.instagram ?? undefined,
  };

  return (
    <article className="grid gap-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p>
        <Link href="/" className="font-bold text-navy underline-offset-4 hover:underline">
          ← Celebrações
        </Link>
      </p>
      <header className="grid gap-3">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-gold">
          {KIND_LABEL[place.kind]} · {place.neighborhood}
        </p>
        <h1 className="font-serif text-5xl text-navy sm:text-6xl">{place.name}</h1>
        <p className="text-xl">{place.address}{place.postalCode ? ` · CEP ${place.postalCode}` : ""} · Londrina/PR</p>
        <DistanceNote lat={place.lat} lng={place.lng} center={catalog.center} />
        <p>
          <span className="rounded-full bg-navy px-3 py-1 text-sm font-bold text-white">
            {STATUS_LABEL[place.scheduleStatus]}
          </span>
          {place.lastConfirmedAt ? (
            <span className="ml-3">
              Última confirmação em {formatConfirmedDate(place.lastConfirmedAt)}.
            </span>
          ) : (
            <span className="ml-3">Ainda sem data de confirmação da grade.</span>
          )}
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <a
          className="inline-flex min-h-14 items-center rounded-full bg-navy px-5 font-bold text-white"
          href={mapsDirectionsUrl(place.lat, place.lng)}
          target="_blank"
          rel="noreferrer"
        >
          Como chegar no Google Maps
        </a>
        <a
          className="inline-flex min-h-14 items-center rounded-full border border-navy px-5 font-bold text-navy"
          href={wazeUrl(place.lat, place.lng)}
          target="_blank"
          rel="noreferrer"
        >
          Abrir no Waze
        </a>
        {place.phone ? (
          <a className="inline-flex min-h-14 items-center rounded-full border border-line bg-paper px-5 font-bold" href={telHref(place.phone)}>
            Ligar {place.phone}
          </a>
        ) : null}
      </div>

      {place.tags.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Etiquetas">
          {place.tags.map((tag) => (
            <li key={tag} className="rounded-full bg-gold-bright px-4 py-2 font-bold text-navy">
              {tag}
            </li>
          ))}
        </ul>
      ) : null}

      <section className="grid gap-4">
        <h2 className="font-serif text-4xl text-navy">Grade da semana</h2>
        {days.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-line bg-paper p-5 text-xl">
            Horários a confirmar. Fale com a secretaria antes de sair de casa.
          </p>
        ) : (
          <div className="grid gap-3">
            {days.map(([weekday, schedules]) => (
              <section key={weekday} className="rounded-3xl border border-line bg-paper p-4 sm:p-5">
                <h3 className="font-serif text-3xl capitalize text-navy">
                  {WEEKDAY_LONG[weekday]}
                </h3>
                <ul className="mt-2 grid gap-2">
                  {schedules
                    .slice()
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((schedule) => (
                      <li key={`${schedule.type}-${schedule.time}-${schedule.weekOfMonth ?? "s"}`}>
                        <span className="font-serif text-3xl text-navy">
                          {formatClockRange(schedule.time, schedule.endTime)}
                        </span>{" "}
                        <span className="font-bold">{TYPE_LABEL[schedule.type]}</span>
                        {schedule.weekOfMonth ? (
                          <span className="text-muted">
                            {" "}
                            · {schedule.weekOfMonth}ª semana do mês
                          </span>
                        ) : null}
                        {schedule.notes ? (
                          <span className="block text-muted">{schedule.notes}</span>
                        ) : null}
                      </li>
                    ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </section>

      {place.notes ? (
        <section className="rounded-3xl bg-ivory p-5">
          <h2 className="font-serif text-3xl text-navy">Observações</h2>
          <p className="mt-2">{place.notes}</p>
        </section>
      ) : null}

      {place.geoNote ? <p className="text-muted">{place.geoNote}</p> : null}

      <ParishMap
        origin={{ ...catalog.center, label: catalog.center.label }}
        markers={[
          {
            slug: place.slug,
            name: place.name,
            neighborhood: place.neighborhood,
            lat: place.lat,
            lng: place.lng,
            distanceLabel: place.neighborhood,
            summary: place.address,
          },
        ]}
      />

      <section className="grid gap-2 rounded-3xl border border-line bg-paper p-5">
        <h2 className="font-serif text-3xl text-navy">Fonte</h2>
        <p>
          <a className="font-bold text-navy underline" href={place.sourceUrl} target="_blank" rel="noreferrer">
            {place.sourceLabel}
          </a>
        </p>
        <p className="text-muted">
          {source === "supabase"
            ? "Esta ficha veio do Supabase."
            : "Esta ficha veio do arquivo local, porque o banco ainda não tem linhas."}
        </p>
        <div className="flex flex-wrap gap-4">
          {place.website ? (
            <a className="font-bold underline" href={place.website} target="_blank" rel="noreferrer">
              Site da comunidade
            </a>
          ) : null}
          {place.instagram ? (
            <a className="font-bold underline" href={place.instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
          ) : null}
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-paper p-5">
        <SuggestionForm placeSlug={place.slug} placeName={place.name} />
      </section>
    </article>
  );
}
