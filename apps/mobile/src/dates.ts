import type { Weekday } from "@kanon/engine";

const WEEKDAYS: Weekday[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function todayWeekday(): Weekday {
  return WEEKDAYS[new Date().getDay()] as Weekday;
}

export function addDaysISO(iso: string, days: number): string {
  return new Date(Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000)
    .toISOString()
    .slice(0, 10);
}

export function weekdayOf(iso: string): Weekday {
  return WEEKDAYS[new Date(`${iso}T00:00:00Z`).getUTCDay()] as Weekday;
}
