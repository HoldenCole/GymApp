/**
 * Display units. Everything is stored metric; imperial is a view.
 * Default display is imperial per the US-scoped v1.
 */

export type UnitSystem = "imperial" | "metric";

export const KG_PER_LB = 0.45359237;

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

export function cmToIn(cm: number): number {
  return cm / 2.54;
}

export function inToCm(inches: number): number {
  return inches * 2.54;
}

export function formatWeight(kg: number, units: UnitSystem): string {
  return units === "metric"
    ? `${(Math.round(kg * 10) / 10).toFixed(1)} kg`
    : `${(Math.round(kgToLb(kg) * 10) / 10).toFixed(1)} lb`;
}

export function weightUnitLabel(units: UnitSystem): string {
  return units === "metric" ? "kg" : "lb";
}

export function heightUnitLabel(units: UnitSystem): string {
  return units === "metric" ? "cm" : "in";
}
