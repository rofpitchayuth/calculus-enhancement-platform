// src/features/dashboard/pages/DashboardOverviewPage.tsx

import { StatCard, ChapterCard, ProgressBarComponent, RadarChartComponent } from "../components";
import {
  MOCK_CHAPTERS,
  DASHBOARD_OVERVIEW_STATS,
  DASHBOARD_CHAPTER_PROGRESS,
  DASHBOARD_OVERALL_SKILLS_RADAR,
} from "../data/mockData";

export function DashboardOverviewPage() {
  return (
    <div className="min-h-screen bg-[#E8F4FF] px-10 py-8">
      <h1 className="text-3xl font-extrabold text-[#003B62] mb-2">
        LEARNING DASHBOARD
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        ภาพรวมพัฒนาการเรียนรู้ของคุณในแต่ละบทของคอร์ส Calculus
      </p>

      {/* สรุปตัวเลขรวม */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="จำนวนบททั้งหมด" value={DASHBOARD_OVERVIEW_STATS.totalChapters} />
        <StatCard label="คะแนนเฉลี่ยรวม" value={DASHBOARD_OVERVIEW_STATS.averageScore} />
        <StatCard label="จำนวนรอบที่ทำแบบทดสอบ" value={DASHBOARD_OVERVIEW_STATS.totalAttempts} />
      </div>

      {/* Card ของแต่ละบท */}
      <h2 className="text-xl font-semibold text-[#003B62] mb-3">
        ภาพรวมแต่ละบท
      </h2>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {MOCK_CHAPTERS.map((chapter) => (
          <ChapterCard key={chapter.id} chapter={chapter} />
        ))}
      </div>

      {/* Skills Progress Section */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-[#003B62] mb-6">ความก้าวหน้าการเรียนแต่ละบท</h2>
        <div className="grid grid-cols-3 gap-8">
          {Object.entries(DASHBOARD_CHAPTER_PROGRESS).map(([chapter, progress]) => (
            <div key={chapter}>
              <h3 className="font-semibold text-gray-700 mb-4 capitalize">
                {chapter === "limit" ? "Limits" : chapter === "differential" ? "Differential" : "Integral"}
              </h3>
              <ProgressBarComponent
                label="ความสำเร็จ"
                current={progress.completed}
                total={progress.total}
                color="bg-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Overall Skills Radar */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-[#003B62] mb-6">ภาพรวมทักษะตามบท</h2>
        <RadarChartComponent
          data={DASHBOARD_OVERALL_SKILLS_RADAR}
          dataKey="limit"
          angleKey="skill"
          fill="#3b82f6"
          height={350}
        />
      </div>
    </div>
  );
}
