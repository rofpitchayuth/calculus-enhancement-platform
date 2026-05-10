// src/features/dashboard/components/DonutChartComponent.tsx

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type { DonutChartComponentProps } from "../types/dashboard.types";

interface DonutChartProps extends DonutChartComponentProps {
  showLegend?: boolean;
  centerLabelClassName?: string;
}

/**
 * Donut Chart Component
 * - centerLabel จะถูกวางไว้ "กลางรู" ของโดนัทจริง ๆ (overlay ด้วย absolute positioning)
 * - เพิ่ม showLegend (default: true) เผื่อกรณีไม่ต้องการ legend (เช่นใน CourseReportPage)
 */
export function DonutChartComponent({
  data,
  title,
  height = 300,
  centerLabel,
  showLegend = true,
  centerLabelClassName,
}: DonutChartProps) {
  return (
    <div className="w-full">
      {title && (
        <p className="text-sm font-semibold text-gray-700 mb-3">{title}</p>
      )}

      <div className="relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="85%"
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            {showLegend && <Legend verticalAlign="bottom" iconType="circle" />}
          </PieChart>
        </ResponsiveContainer>

        {centerLabel && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              className={
                centerLabelClassName ??
                "text-6xl font-extrabold text-[#003B62]"
              }
            >
              {centerLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
