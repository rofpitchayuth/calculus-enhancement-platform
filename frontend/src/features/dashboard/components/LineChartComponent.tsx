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
 */
export function LineChartComponent({
  data,
  dataKey,
  title,
  xAxisKey = "attempt",
  stroke = "#3b82f6",
}: LineChartComponentProps) {
  return (

    <div className="w-full h-full pb-6">
  {title && (
    <p className="text-lg font-semibold text-right text-gray-900 mb-2">
      {title}
    </p>
  )}

  <ResponsiveContainer width="100%" height="100%" >
    <LineChart
      data={data}
      margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
    >
      {/* เส้น grid แนวนอนจาง ๆ */}
      <CartesianGrid
        vertical={false}
        stroke="#E5E7EB"       // เทาอ่อน
        strokeDasharray="0"    // เส้นทึบ ไม่เป็นประ
      />

      {/* แกน X แบบเรียบ ๆ */}
      <XAxis
        dataKey={xAxisKey}
        axisLine={false}        // ไม่เอาเส้นแกนล่าง
        tickLine={false}        // ไม่เอาขีดเล็ก ๆ
        tick={{ fontSize: 12, fill: "#4B5563" }}
      />

      {/* แกน Y แบบเรียบ ๆ */}
      <YAxis
        axisLine={false}
        tickLine={false}
        tick={{ fontSize: 12, fill: "#4B5563" }}
      />

      {/* Tooltip ตอน hover */}
      <Tooltip
        contentStyle={{ fontSize: "12px" }}
        labelStyle={{ fontSize: "12px" }}
        itemStyle={{ fontSize: "12px" }}
      />

      {/* ไม่ใช้ Legend เพื่อไม่ให้มี "score" ด้านล่าง */}
      {/* <Legend /> */}

      {/* เส้นกราฟแบบรูป 2 */}
      <Line
        type="monotone"
        dataKey={dataKey}
        stroke={stroke || "#1D4ED8"}  // น้ำเงินเข้ม ถ้าไม่ได้ส่ง stroke มา
        strokeWidth={2}
        dot={{ r: 4 }}
        activeDot={{ r: 6 }}
      />
    </LineChart>
  </ResponsiveContainer>
</div>

  );
}
