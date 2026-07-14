import { describe, expect, it } from "vitest";
import {
  kgToLb,
  lbToKg,
  normalizeLog,
  trendSeries,
  weeklyRate,
  WeightEntry,
} from "../src";

function linearLog(startKg: number, kgPerDay: number, days: number): WeightEntry[] {
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10),
    weightKg: startKg + kgPerDay * i,
  }));
}

describe("weight log", () => {
  it("normalizes: sorted, one entry per date, last write wins", () => {
    const log = normalizeLog([
      { date: "2026-01-03", weightKg: 81 },
      { date: "2026-01-01", weightKg: 80 },
      { date: "2026-01-03", weightKg: 80.6 },
    ]);
    expect(log.map((e) => e.date)).toEqual(["2026-01-01", "2026-01-03"]);
    expect(log[1]?.weightKg).toBe(80.6);
  });

  it("trend smooths noise but follows the data", () => {
    const noisy: WeightEntry[] = linearLog(80, 0, 14).map((e, i) => ({
      ...e,
      weightKg: e.weightKg + (i % 2 === 0 ? 0.6 : -0.6),
    }));
    const series = trendSeries(noisy);
    const last = series[series.length - 1]!;
    expect(Math.abs(last.trendKg - 80)).toBeLessThan(0.4);
  });

  it("weekly rate recovers a steady loss", () => {
    // −0.1 kg/day = −0.7 kg/week
    const rate = weeklyRate(linearLog(80, -0.1, 28));
    expect(rate).not.toBeNull();
    expect(rate!.kgPerWeek).toBeLessThan(-0.5);
    expect(rate!.kgPerWeek).toBeGreaterThan(-0.9);
    expect(rate!.pctPerWeek).toBeLessThan(0);
  });

  it("returns null rather than a verdict from too little data", () => {
    expect(weeklyRate([])).toBeNull();
    expect(weeklyRate(linearLog(80, -0.1, 2))).toBeNull();
  });

  it("irregular gaps don't distort the trend", () => {
    const sparse: WeightEntry[] = [
      { date: "2026-01-01", weightKg: 80 },
      { date: "2026-01-02", weightKg: 80 },
      { date: "2026-01-20", weightKg: 78 }, // long gap: trend should move well toward the new reading
    ];
    const last = trendSeries(sparse)[2]!;
    expect(last.trendKg).toBeLessThan(78.5);
    expect(last.trendKg).toBeGreaterThanOrEqual(78);
  });
});

describe("units", () => {
  it("kg ↔ lb round-trips", () => {
    expect(kgToLb(lbToKg(185))).toBeCloseTo(185, 6);
    expect(Math.round(kgToLb(80) * 10) / 10).toBe(176.4);
  });
});
