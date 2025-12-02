// src/features/dashboard/components/ReportCard.tsx

import type { StatCardProps } from "../types/dashboard.type";

/**
 * Report Card Component - สำหรับแสดง summary card ใน CourseReportPage
 * ใช้งานเดียวกับ StatCard แต่มี style ที่เล็กน้อย
 */
export function ReportCard({ label, value }: Omit<StatCardProps, "sub" | "subClass">) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-semibold text-[#003B62] mt-1">{value}</p>
    </div>
  );
}
