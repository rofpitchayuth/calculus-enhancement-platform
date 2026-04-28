/**
 * SkillsRadarChart.tsx — Presentation Component
 * ===============================================
 * Renders a Radar/Spider chart showing the student's mastery level (0.0–1.0)
 * across different calculus sub-topics.
 *
 * Rules enforced here:
 *   - Purely presentational: receives all data via props, zero internal state.
 *   - Domain values are 0.0–1.0; the chart axis domain is set accordingly.
 *   - No API calls, no service imports.
 */

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { SkillMastery } from "../types/dashboard.types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SkillsRadarChartProps {
  skills: SkillMastery[];
  /** Chart height in pixels. Defaults to 300. */
  height?: number;
}

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------

/**
 * Custom tooltip rendered on hover to show the exact mastery percentage
 * with a clean, styled card — replacing the default recharts tooltip.
 */
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: SkillMastery }> }) {
  if (!active || !payload?.length) return null;

  const { skill, mastery } = payload[0].payload;
  const percent = Math.round(mastery * 100);

  return (
    <div className="bg-white border border-indigo-100 rounded-xl shadow-lg px-4 py-3">
      <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">
        {skill}
      </p>
      <p className="text-2xl font-black text-gray-800">{percent}%</p>
      <p className="text-xs text-gray-400">mastery level</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * SkillsRadarChart
 *
 * Renders a spider chart where each axis represents a calculus sub-topic
 * and the plotted value is the DKT-GRU mastery probability (0–1).
 *
 * The axis domain is fixed at [0, 1] so the visual scale is always consistent
 * regardless of the actual data range.
 */
export function SkillsRadarChart({ skills, height = 300 }: SkillsRadarChartProps) {
  return (
    <div className="w-full flex flex-col gap-2">
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={skills}
            outerRadius="72%"
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            {/* Circular grid rings */}
            <PolarGrid
              gridType="circle"
              radialLines={true}
              stroke="#E0E7FF"
              strokeDasharray="4 2"
            />

            {/* Skill name labels around the perimeter */}
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fill: "#374151", fontSize: 12, fontWeight: 600 }}
            />

            {/* Numeric radius axis — hidden ticks but visible rings */}
            <PolarRadiusAxis
              angle={90}
              domain={[0, 1]}
              tickCount={5}
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              axisLine={false}
              tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
            />

            {/* The main filled radar area */}
            <Radar
              name="Mastery"
              dataKey="mastery"
              stroke="#6366F1"
              strokeWidth={2}
              fill="#6366F1"
              fillOpacity={0.18}
              dot={{ r: 4, fill: "#6366F1", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#4F46E5", strokeWidth: 2, stroke: "#fff" }}
            />

            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend row */}
      <div className="flex items-center gap-2 justify-center">
        <span className="inline-block w-3 h-3 rounded-full bg-indigo-500" />
        <span className="text-xs text-gray-500 font-medium">
          Mastery Level (0% – 100%)
        </span>
      </div>
    </div>
  );
}
