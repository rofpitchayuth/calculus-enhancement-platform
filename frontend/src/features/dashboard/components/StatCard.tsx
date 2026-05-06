// src/features/dashboard/components/StatCard.tsx

import type { ReactNode } from "react";
import type { StatCardProps } from "../types/dashboard.types";

/**
 * Override `sub` ให้รับ ReactNode ได้ (เดิมเป็น string)
 * เพื่อให้ส่ง trend badge แบบ JSX เข้ามาได้ เช่น (+8) เป็นสีเขียว
 */
type Props = Omit<StatCardProps, "sub"> & {
  sub?: ReactNode;
};

/**
 * Stat Card Component - สำหรับแสดงสถิติด้วย label + value (+ optional sub)
 * ใช้งานใน ChapterDashboardPage, DashboardOverviewPage
 */
export function StatCard({ label, value, sub, subClass }: Props) {
  return (
    <div className="bg-white rounded-2xl border px-5 py-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-[#003B62] flex items-baseline space-x-2">
        <span>{value}</span>
        {sub &&
          (typeof sub === "string" || typeof sub === "number" ? (
            <span className={`text-xs ${subClass ?? ""}`}>{sub}</span>
          ) : (
            // ถ้าเป็น JSX/ReactNode ปล่อยให้ component ภายในจัดการ style เอง
            sub
          ))}
      </div>
    </div>
  );
}
