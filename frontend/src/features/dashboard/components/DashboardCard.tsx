// src/features/dashboard/components/DashboardCard.tsx

import type { DashboardCardProps } from "../types/dashboard.type";

/**
 * Dashboard Card Component - สำหรับ wrap content ที่มี title
 * ใช้งานใน ChapterDashboardPage, CourseReportPage
 */
export function DashboardCard({ title, children }: DashboardCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md px-7 py-5">
      {title && (
        <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      )}
      {children}
    </div>
  );
}
