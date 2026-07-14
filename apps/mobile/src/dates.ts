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
