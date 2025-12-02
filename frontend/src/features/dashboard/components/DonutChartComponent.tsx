// src/features/dashboard/components/DonutChartComponent.tsx

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface DonutChartData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface DonutChartComponentProps {
  data: DonutChartData[];
  title?: string;
  height?: number;
  centerLabel?: string;
}

/**
 * Donut Chart Component - ใช้แสดง score distribution หรือ percentage breakdown
 */
export function DonutChartComponent({
  data,
  title,
  height = 300,
  centerLabel,
}: DonutChartComponentProps) {
  return (
    <div>
      {title && <p className="text-sm font-semibold text-gray-700 mb-3">{title}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div className="text-center text-2xl font-bold text-[#003B62]">
          {centerLabel}
        </div>
      )}
    </div>
  );
}
