"use client";

import { useState } from "react";
import { haversineKm } from "@/lib/geo";
import { formatKm } from "@/lib/format";

export function DistanceNote({
  lat,
  lng,
  center,
}: {
  lat: number;
  lng: number;
  center: { lat: number; lng: number; label: string };
}) {
  const [distance, setDistance] = useState<string | null>(null);
  const [label, setLabel] = useState(center.label);
  const fromCenter = formatKm(haversineKm(center, { lat, lng }));

  function locate() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const km = haversineKm(
          { lat: position.coords.latitude, lng: position.coords.longitude },
          { lat, lng },
        );
        setDistance(formatKm(km));
        setLabel("você");
      },
      () => {
        setDistance(null);
        setLabel(center.label);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 },
    );
  }

  return (
    <p className="text-lg">
      {distance ? `${distance} de ${label}` : `${fromCenter} do ${label}`}.{" "}
      <button type="button" onClick={locate} className="font-bold text-navy underline">
        Usar minha localização
      </button>
    </p>
  );
}
