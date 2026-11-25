export const TIMEZONE = "America/Sao_Paulo";

export type CelebrationType = "missa" | "confissao" | "adoracao";
export type ScheduleStatus = "confirmado" | "parcial" | "a_confirmar";
export type PlaceKind = "catedral" | "paroquia" | "santuario" | "capela";
export type GeoPrecision = "edificio" | "via";

export type Schedule = {
  weekday: number;
  time: string;
  endTime: string | null;
  type: CelebrationType;
  notes: string | null;
  weekOfMonth: number | null;
};

export type Place = {
  slug: string;
  name: string;
  kind: PlaceKind;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string | null;
  lat: number;
  lng: number;
  geoPrecision: GeoPrecision;
  geoNote: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  tags: string[];
  sourceUrl: string;
  sourceLabel: string;
  scheduleStatus: ScheduleStatus;
  lastConfirmedAt: string | null;
  notes: string | null;
  schedules: Schedule[];
};

export type DataSource = "supabase" | "local";

export type Catalog = {
  updatedAt: string;
  timezone: string;
  city: string;
  center: { lat: number; lng: number; label: string };
  places: Place[];
};

export type Origin = {
  lat: number;
  lng: number;
  label: string;
};
