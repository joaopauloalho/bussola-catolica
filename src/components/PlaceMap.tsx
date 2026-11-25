"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Origin } from "@/lib/types";

export type MapMarker = {
  slug: string;
  name: string;
  neighborhood: string;
  lat: number;
  lng: number;
  distanceLabel: string;
  summary: string;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char];
  });
}

export function PlaceMap({
  markers,
  origin,
}: {
  markers: MapMarker[];
  origin: Origin;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let cancelled = false;
    const node = nodeRef.current;
    if (!node) return;

    (async () => {
      const L = await import("leaflet");
      if (cancelled) return;
      mapRef.current?.remove();
      const map = L.map(node, {
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView([origin.lat, origin.lng], 13);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const bounds = L.latLngBounds([]);
      const user = L.marker([origin.lat, origin.lng], {
        icon: L.divIcon({
          className: "",
          html: '<span class="user-marker"></span>',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        }),
        title: origin.label,
      }).addTo(map);
      user.bindPopup(`<strong>Você</strong><br />${escapeHtml(origin.label)}`);
      bounds.extend([origin.lat, origin.lng]);

      for (const marker of markers) {
        const pin = L.marker([marker.lat, marker.lng], {
          icon: L.divIcon({
            className: "",
            html: '<span class="parish-marker">†</span>',
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          }),
          title: marker.name,
        }).addTo(map);
        pin.bindPopup(
          `<strong>${escapeHtml(marker.name)}</strong><br />${escapeHtml(marker.neighborhood)} · ${escapeHtml(marker.distanceLabel)}<br />${escapeHtml(marker.summary)}<br /><a href="/paroquia/${encodeURIComponent(marker.slug)}">Ver horários</a>`,
        );
        bounds.extend([marker.lat, marker.lng]);
      }

      if (markers.length > 0) {
        map.fitBounds(bounds.pad(0.18), { maxZoom: 15 });
      }
      mapRef.current = map;
      window.setTimeout(() => map.invalidateSize(), 50);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [markers, origin]);

  return (
    <div
      ref={nodeRef}
      className="h-[70vh] min-h-[28rem] w-full overflow-hidden rounded-3xl border border-line"
      role="application"
      aria-label="Mapa das paróquias filtradas. Cada marcador abre o nome, a distância e um link para os horários."
    />
  );
}
