import { useState, useEffect } from "react";
import { StatCard, ChapterCard, ProgressBarComponent, RadarChartComponent } from "../components";
import { dashboardService } from "../services/dashboard.service";
import { MOCK_CHAPTERS } from "../data/mockData"; // Keep this for the static list of chapters to render cards

export function DashboardOverviewPage() {
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [chapterProgress, setChapterProgress] = useState<any>(null);
  const [skillsRadar, setSkillsRadar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [overviewRes, progressRes, radarRes] = await Promise.all([
          dashboardService.getOverviewStats(),
          dashboardService.getChapterProgress(),
          dashboardService.getSkillsRadar()
        ]);

        setOverviewStats(overviewRes);
        setChapterProgress(progressRes.data);
        setSkillsRadar(radarRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !overviewStats || !chapterProgress) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#003B62] mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-4">
      <h1 className="text-4xl font-extrabold text-[#003B62] mb-6">
        PUNPUN's DASHBOARD
      </h1>

      {/* สรุปตัวเลขรวม */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="จำนวนบททั้งหมด" value={overviewStats.totalChapters} />
        <StatCard label="คะแนนเฉลี่ยรวม" value={overviewStats.averageScore} />
        <StatCard label="จำนวนรอบที่ทำแบบทดสอบ" value={overviewStats.totalAttempts} />
      </div>

      {/* Card ของแต่ละบท */}
      <h2 className="text-xl font-semibold text-[#003B62] mb-3">
        ภาพรวมแต่ละบท
      </h2>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {MOCK_CHAPTERS.map((chapter) => (
          <ChapterCard key={chapter.id} chapter={chapter} stats={overviewStats} />
        ))}
      </div>

      {/* Skills Progress Section */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-[#003B62] mb-6">ความก้าวหน้าการเรียนแต่ละบท</h2>
        <div className="grid grid-cols-3 gap-8">
          {Object.entries(chapterProgress).map(([chapter, progress]: [string, any]) => (
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
        {skillsRadar.length > 0 && (
          <RadarChartComponent
            data={skillsRadar}
            dataKey="limit"
            angleKey="skill"
            fill="#3b82f6"
            height={350}
          />
        )}
      </div>
    </div>
  );
}
