/**
 * Axed thin charts (UI brief §2 — chart law):
 * - Every chart carries axes: y-axis values, x-axis time labels,
 *   gridlines, and a goal reference line where a goal exists.
 *   A line with no axis is banned.
 * - Thin lines (≈1.2–1.5px weight trend; thin multi-line for macros),
 *   faint daily dots under the weight trend, today's reading filled.
 * - Dashed goal lines. No gradient bars, no aggressive smoothing —
 *   lines follow the data.
 * - Identity is never color-alone: every series is direct-labeled
 *   (this is also the validator's relief for the deep gold's contrast).
 */

import { Text as RNText, View } from "react-native";
import Svg, { Circle, G, Line, Path, Text as SvgText } from "react-native-svg";
import { colors } from "./theme";

export interface ChartSeries {
  label: string;
  color: string;
  /** Index-aligned to the x grid; null = gap (unknown, not zero). */
  values: (number | null)[];
  /** Optional dashed reference (the goal) drawn in the series hue. */
  goal?: number;
}

export interface ChartDot {
  index: number;
  value: number;
  filled?: boolean;
}

interface Props {
  series: ChartSeries[];
  /** X-axis tick labels by index (sparse — only listed indices render). */
  xLabels: Record<number, string>;
  pointCount: number;
  width: number;
  height?: number;
  /** Faint daily dots (weight chart) — drawn under the first series. */
  dots?: ChartDot[];
  /** Zoom y to the data range (weight chart) instead of starting at 0. */
  zoomY?: boolean;
  yFormat?: (v: number) => string;
}

const PAD = { top: 8, right: 8, bottom: 18, left: 38 };

export function AxedLineChart({
  series,
  xLabels,
  pointCount,
  width,
  height = 160,
  dots = [],
  zoomY = false,
  yFormat = (v) => String(Math.round(v)),
}: Props) {
  const plotW = width - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;

  const numbers = [
    ...series.flatMap((s) => s.values.filter((v): v is number => v !== null)),
    ...series.flatMap((s) => (s.goal !== undefined ? [s.goal] : [])),
    ...dots.map((d) => d.value),
  ];
  if (numbers.length === 0) {
    return (
      <RNText style={{ color: colors.grayInactive, fontSize: 13 }}>
        Nothing to chart yet.
      </RNText>
    );
  }

  let lo = Math.min(...numbers);
  let hi = Math.max(...numbers);
  if (!zoomY) lo = Math.min(0, lo);
  if (hi === lo) hi = lo + 1;
  const span = hi - lo;
  lo -= zoomY ? span * 0.1 : 0;
  hi += span * 0.1;

  const x = (i: number) =>
    PAD.left + (pointCount <= 1 ? plotW / 2 : (i / (pointCount - 1)) * plotW);
  const y = (v: number) => PAD.top + plotH - ((v - lo) / (hi - lo)) * plotH;

  const ticks = [lo + (hi - lo) * 0.1, (lo + hi) / 2, hi - (hi - lo) * 0.1].map(
    (v) => Math.round(v),
  );

  return (
    <View>
      <Svg width={width} height={height}>
        {/* gridlines + y-axis values */}
        {ticks.map((t) => (
          <G key={t}>
            <Line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke={colors.hairlineMajor}
              strokeWidth={1}
            />
            <SvgText
              x={PAD.left - 6}
              y={y(t) + 3}
              fontSize={9}
              fill={colors.grayLabel}
              textAnchor="end"
            >
              {yFormat(t)}
            </SvgText>
          </G>
        ))}

        {/* x-axis labels */}
        {Object.entries(xLabels).map(([i, label]) => (
          <SvgText
            key={i}
            x={x(Number(i))}
            y={height - 4}
            fontSize={9}
            fill={colors.grayLabel}
            textAnchor="middle"
          >
            {label}
          </SvgText>
        ))}

        {/* faint daily dots (under the trend) */}
        {dots.map((d, i) => (
          <Circle
            key={i}
            cx={x(d.index)}
            cy={y(d.value)}
            r={d.filled ? 3 : 2}
            fill={d.filled ? colors.teal : `${colors.teal}55`}
          />
        ))}

        {/* dashed goal lines */}
        {series.map((s) =>
          s.goal !== undefined ? (
            <Line
              key={`goal-${s.label}`}
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(s.goal)}
              y2={y(s.goal)}
              stroke={s.color}
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.7}
            />
          ) : null,
        )}

        {/* the thin lines — gaps stay gaps */}
        {series.map((s) => (
          <Path
            key={s.label}
            d={pathWithGaps(s.values, x, y)}
            stroke={s.color}
            strokeWidth={1.5}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
      </Svg>

      {/* legend — always present for ≥2 series; direct labels carry identity */}
      {series.length >= 2 ? (
        <View style={{ flexDirection: "row", gap: 14, marginTop: 2 }}>
          {series.map((s) => (
            <View key={s.label} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <View style={{ width: 10, height: 2, backgroundColor: s.color }} />
              <RNText style={{ fontSize: 11, color: colors.graySecondary }}>{s.label}</RNText>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function pathWithGaps(
  values: (number | null)[],
  x: (i: number) => number,
  y: (v: number) => number,
): string {
  let d = "";
  let pen = false;
  values.forEach((v, i) => {
    if (v === null) {
      pen = false;
      return;
    }
    d += `${pen ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
    pen = true;
  });
  return d;
}
