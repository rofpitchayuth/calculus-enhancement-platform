// src/features/dashboard/components/LineChartComponent.tsx

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface LineChartData {
  [key: string]: string | number;
}

interface LineChartComponentProps {
  data: LineChartData[];
  dataKey: string;
  title?: string;
  xAxisKey?: string;
  stroke?: string;
  height?: number;
}

/**
 * Line Chart Component - ใช้แสดง progression charts
 *
 * NOTE: รองรับ height prop จริง ๆ แล้ว (เดิม height ถูก ignore ทำให้กราฟไม่แสดง)
 */
export function LineChartComponent({
  data,
  dataKey,
  title,
  xAxisKey = "attempt",
  stroke = "#1D4ED8",
  height = 280,
}: LineChartComponentProps) {
  return (
    <div className="w-full">
      {title && (
        <p className="text-lg font-semibold text-right text-gray-900 mb-2">
          {title}
        </p>
      )}

      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#E5E7EB"
              strokeDasharray="0"
            />

            <XAxis
              dataKey={xAxisKey}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#4B5563" }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#4B5563" }}
            />

            <Tooltip
              contentStyle={{ fontSize: "12px" }}
              labelStyle={{ fontSize: "12px" }}
              itemStyle={{ fontSize: "12px" }}
            />

            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={stroke}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
