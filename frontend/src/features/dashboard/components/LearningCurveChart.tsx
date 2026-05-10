/**
 * LearningCurveChart.tsx — Presentation Component
 * ================================================
 * Renders a Line chart showing the student's overall mastery progression
 * over sequential quiz attempts (the "Learning Curve").
 *
 * Rules enforced here:
 *   - Purely presentational: receives all data via props, zero internal state.
 *   - Domain values are 0.0–1.0; Y-axis fixed accordingly.
 *   - A reference line at 0.70 marks the "Mastery Threshold" target.
 *   - No API calls, no service imports.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { ProgressionPoint } from "../types/dashboard.types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** The DKT-GRU mastery threshold — students are considered "proficient" above this. */
const MASTERY_THRESHOLD = 0.7;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LearningCurveChartProps {
  progression: ProgressionPoint[];
  /** Chart height in pixels. Defaults to 260. */
  height?: number;
}

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ProgressionPoint }>;
  label?: number;
}

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;
  const percent = Math.round(point.mastery * 100);
  const isAboveThreshold = point.mastery >= MASTERY_THRESHOLD;

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 min-w-[130px]">
      <p className="text-xs text-gray-400 font-medium mb-1">Attempt #{label}</p>
      {point.date && (
        <p className="text-xs text-gray-300 mb-2">{point.date}</p>
      )}
      <p
        className={`text-2xl font-black ${
          isAboveThreshold ? "text-emerald-500" : "text-blue-500"
        }`}
      >
        {percent}%
      </p>
      <p className="text-xs text-gray-400">mastery</p>
      {isAboveThreshold && (
        <span className="inline-block mt-2 text-[10px] font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
          ✓ Above threshold
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * LearningCurveChart
 *
 * Plots overall mastery probability vs. quiz attempt number.
 * Includes a dashed reference line at 0.70 to mark the mastery threshold.
 * Y-axis is always fixed to [0, 1] so the scale is consistent across students.
 */
export function LearningCurveChart({
  progression,
  height = 260,
}: LearningCurveChartProps) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={progression}
          margin={{ top: 16, right: 20, left: 0, bottom: 8 }}
        >
          {/* Subtle horizontal grid lines only */}
          <CartesianGrid
            vertical={false}
            stroke="#F3F4F6"
            strokeDasharray="0"
          />

          {/* X-axis: attempt numbers */}
          <XAxis
            dataKey="attempt"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6B7280" }}
            label={{
              value: "Attempt",
              position: "insideBottom",
              offset: -4,
              fontSize: 11,
              fill: "#9CA3AF",
            }}
          />

          {/* Y-axis: mastery 0–1 displayed as 0%–100% */}
          <YAxis
            domain={[0, 1]}
            tickCount={6}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
            width={42}
          />

          {/* Mastery threshold reference line */}
          <ReferenceLine
            y={MASTERY_THRESHOLD}
            stroke="#10B981"
            strokeDasharray="6 3"
            strokeWidth={1.5}
            label={{
              value: "Target 70%",
              position: "right",
              fontSize: 10,
              fill: "#10B981",
              fontWeight: 600,
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Main learning curve */}
          <Line
            type="monotone"
            dataKey="mastery"
            stroke="#3B82F6"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#3B82F6", strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 6, fill: "#2563EB", stroke: "#fff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
