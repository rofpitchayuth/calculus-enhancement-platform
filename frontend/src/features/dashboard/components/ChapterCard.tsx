// src/features/dashboard/components/ChapterCard.tsx


import type { ChapterSummary } from "../types/dashboard.type";

type DashboardOverviewStats = {
  totalChapters: string;
  averageScore: string;
  totalAttempts: string;
};



/**
 * Chapter Card Component - สำหรับแสดงการ์ดแต่ละบทใน DashboardOverviewPage
 */
export function ChapterCard({
  chapter,
  stats,
}: {
  chapter: ChapterSummary;
  stats: DashboardOverviewStats;
}) {
  const trendLabel =
    chapter.trend === "up"
      ? "(+)"
      : chapter.trend === "down"
        ? "(-)"
        : "";

  return (
    <a href={`/dashboard/chapter/${chapter.id}`} className="bg-white rounded-2xl shadow-md p-5 flex flex-col justify-between w-full block">
      <div>
        <h3 className="text-3xl  font-semibold text-[#003B62]">
          {chapter.title}
        </h3>
        <div className="flex flex-row mt-3">
          <div className="text-5xl text-blue-900 font-medium w-35 h-35 rounded-full bg-blue-100 border-yellow-100 border-2 flex items-center justify-center mr-4">
            {chapter.latestScore}%
          </div>
          <div>
            <p className="text-md text-gray-500 mt-2">
              คะแนนล่าสุด : <span className="text-gray-900 font-bold">{chapter.latestScore}%</span> {trendLabel}
            </p>
            <p className="text-md text-gray-500 mt-2">
              คะแนนเฉลี่ยรวม : <span className="text-gray-900 font-bold">{stats.averageScore}</span>
            </p>
            <p className="text-md text-gray-500 mt-2">
              ความเชี่ยวชาญ : <span className="text-gray-900 font-bold">{chapter.attempts}</span> 
            </p>
            <p className="text-md text-gray-500 mt-2">
              จำนวนครั้งที่ทำ : <span className="text-gray-900 font-bold">{stats.totalAttempts}</span>
            </p>
          
          </div>
        </div>











        {/* <p className="text-sm text-gray-500 mt-1">
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
        </a> */}
      </div>
    </a>
  );
}
