// src/features/dashboard/components/RadarChartComponent.tsx

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface RadarChartData {
  [key: string]: string | number;
}

interface RadarChartComponentProps {
  data: RadarChartData[];
  dataKey: string;
  angleKey?: string;
  title?: string;
  fill?: string;
  height?: number;
}

/**
 * Radar Chart Component - ใช้แสดง skills analysis
 */
export function RadarChartComponent({
  data,
  dataKey,
  angleKey = "skill",
  title,
  fill = "#1D4ED8",   // น้ำเงินเข้มหน่อย
  height = 260,
}: RadarChartComponentProps) {
  return (
    <div className="w-full h-full flex flex-col items-center">
      {title && (
        <p className="text-sm font-semibold text-gray-700">
          {title}
        </p>
      )}
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          data={data}
          outerRadius="70%" // ให้กราฟอยู่กลาง card สวย ๆ
          margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
        >
          {/* วงกลมพื้นหลังแบบรูป 2 */}
          <PolarGrid
            gridType="circle"   // ⬅ เปลี่ยนจาก polygon เป็นวงกลม
            radialLines={false} // ไม่เอาเส้นแฉก ๆ ออกจากจุดศูนย์กลาง
            stroke="#E5E7EB"
          />

          {/* ชื่อแต่ละแกนรอบวง */}
          <PolarAngleAxis
            dataKey={angleKey}
            tick={{ fill: "#111827", fontSize: 12 }}
          />

          {/* ซ่อนตัวเลข radius เหลือแต่วงกลม */}
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />

          {/* เส้น + จุดคล้ายรูป 2 */}
          <Radar
            name={dataKey}
            dataKey={dataKey}
            stroke={fill}
            fill={fill}
            fillOpacity={0.1}      // โปร่ง ๆ หน่อย
            dot={{ r: 4 }}         // ให้เห็นจุดเหมือนรูป 2
            activeDot={{ r: 6 }}
          />

          <Tooltip
            contentStyle={{ fontSize: "12px" }}
            labelStyle={{ fontSize: "12px" }}
            itemStyle={{ fontSize: "12px" }}
          />
        </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
