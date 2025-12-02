// src/features/dashboard/components/StatCard.tsx

import type { StatCardProps } from "../types/dashboard.type";

/**
 * Stat Card Component - สำหรับแสดงสถิติด้วย label + value
 * ใช้งานใน ChapterDashboardPage, DashboardOverviewPage
 */
export function StatCard({ label, value, sub, subClass }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md px-5 py-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-[#003B62] flex items-baseline space-x-2">
        <span>{value}</span>
        {sub && <span className={`text-xs ${subClass}`}>{sub}</span>}
      </div>
    </div>
  );
}
