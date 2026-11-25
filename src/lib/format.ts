import { weekdayOf } from "./schedule";

export const WEEKDAY_LONG = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

export const KIND_LABEL = {
  catedral: "Catedral",
  paroquia: "Paróquia",
  santuario: "Santuário",
  capela: "Capela",
} as const;

export const TYPE_LABEL = {
  missa: "Missa",
  confissao: "Confissão",
  adoracao: "Adoração",
} as const;

export const STATUS_LABEL = {
  confirmado: "Confirmado",
  parcial: "Parcial",
  a_confirmar: "A confirmar",
} as const;

export function formatClock(time: string): string {
  const [hourText, minute] = time.split(":");
  const hour = Number(hourText);
  if (minute === "00") return `${hour}h`;
  return `${hour}h${minute}`;
}

export function formatClockRange(time: string, endTime?: string | null): string {
  if (!endTime) return formatClock(time);
  return `${formatClock(time)}–${formatClock(endTime)}`;
}

export function formatKm(km: number): string {
  const digits = km < 10 ? 1 : 0;
  const value = km.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `${value} km`;
}

export function formatLongDate(year: number, month: number, day: number): string {
  const noonUtc = new Date(Date.UTC(year, month - 1, day, 15));
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(noonUtc);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatConfirmedDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

export function formatRelative(
  from: Date,
  to: Date,
): { label: string; accessible: string } {
  const minutes = Math.round((to.getTime() - from.getTime()) / 60000);
  if (minutes <= 0) {
    return { label: "já começou", accessible: "já começou" };
  }
  if (minutes < 60) {
    const unit = minutes === 1 ? "minuto" : "minutos";
    return {
      label: `em ${minutes} min`,
      accessible: `começa em ${minutes} ${unit}`,
    };
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    const unit = hours === 1 ? "hora" : "horas";
    return {
      label: hours === 1 ? "em 1 h" : `em ${hours} h`,
      accessible: `começa em ${hours} ${unit}`,
    };
  }
  const fromParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(from);
  const toParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(to);
  const [fy, fm, fd] = fromParts.split("-").map(Number);
  const [ty, tm, td] = toParts.split("-").map(Number);
  const fromUtc = Date.UTC(fy, fm - 1, fd);
  const toUtc = Date.UTC(ty, tm - 1, td);
  const days = Math.round((toUtc - fromUtc) / 86400000);
  if (days === 1) return { label: "amanhã", accessible: "começa amanhã" };
  const weekday = WEEKDAY_LONG[weekdayOf(ty, tm, td)];
  return { label: weekday, accessible: `começa ${weekday}` };
}
