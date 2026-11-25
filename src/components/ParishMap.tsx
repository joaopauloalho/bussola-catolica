"use client";

import dynamic from "next/dynamic";
import type { Origin } from "@/lib/types";
import type { MapMarker } from "./PlaceMap";

const PlaceMap = dynamic(
  () => import("./PlaceMap").then((mod) => mod.PlaceMap),
  {
    ssr: false,
    loading: () => (
      <p className="grid h-[70vh] min-h-[28rem] place-items-center rounded-3xl border border-line bg-paper">
        Abrindo o mapa…
      </p>
    ),
  },
);

export function ParishMap({
  markers,
  origin,
}: {
  markers: MapMarker[];
  origin: Origin;
}) {
  return <PlaceMap markers={markers} origin={origin} />;
}
