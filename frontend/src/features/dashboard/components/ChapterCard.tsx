// src/features/dashboard/components/ChapterCard.tsx

import type { ChapterSummary } from "../types/dashboard.type";

/**
 * Chapter Card Component - สำหรับแสดงการ์ดแต่ละบทใน DashboardOverviewPage
 */
export function ChapterCard({ chapter }: { chapter: ChapterSummary }) {
  const trendLabel =
    chapter.trend === "up"
      ? "กำลังพัฒนา"
      : chapter.trend === "down"
      ? "ต้องปรับปรุง"
      : "คงที่";

  return (
    <div className="bg-white rounded-2xl shadow-md px-5 py-4 flex flex-col justify-between">
      <div>
        <p className="text-xs text-gray-500 mb-1">บทเรียน</p>
        <h3 className="text-lg font-semibold text-[#003B62]">
          {chapter.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          ทำแบบทดสอบแล้ว {chapter.attempts} รอบ
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">คะแนนล่าสุด</p>
          <p className="text-xl font-bold text-[#003B62]">
            {chapter.latestScore}%
          </p>
          <p className="text-xs text-gray-500 mt-1">{trendLabel}</p>
        </div>

        <a
          href={`/dashboard/chapter/${chapter.id}`}
          className="text-xs px-3 py-2 rounded-full bg-[#003B62] text-white hover:bg-[#005187] transition-colors"
        >
          ดู Dashboard
        </a>
      </div>
    </div>
  );
}
