// src/features/dashboard/components/BloomBar.tsx

import type { BloomBarProps } from "../types/dashboard.type";

/**
 * Bloom Bar Component - สำหรับแสดง progress bar ของ Bloom's Level
 * ใช้งานใน ChapterDashboardPage
 */
export function BloomBar({ label, percent }: BloomBarProps) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
