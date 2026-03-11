import type { ChapterDashboardPageProps } from "../types/dashboard.type";
import { StatCard, DashboardCard, BloomBar, LineChartComponent, RadarChartComponent } from "../components";
import {
  CHAPTER_NAMES,
  BLOOM_LEVELS,
  CHAPTER_STRENGTHS,
  CHAPTER_WEAKNESSES,
} from "../data/mockData";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { dashboardService } from "../services/dashboard.service";

export function ChapterDashboardPage({ chapterId }: ChapterDashboardPageProps) {
  const chapterName =
    (chapterId && CHAPTER_NAMES[chapterId]) || "Differential";

  const navigate = useNavigate();

  const [chapter] = useState(chapterId || "differential");
  const [mode, setMode] = useState("all");

  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [skillsRadar, setSkillsRadar] = useState<any[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapterData = async () => {
      try {
        setLoading(true);
        // Note: For MVP, we are using the global overview and recent attempts
        // In a full implementation, you'd have chapter-specific endpoints.
        const [overviewRes, radarRes, recentRes] = await Promise.all([
          dashboardService.getOverviewStats(),
          dashboardService.getSkillsRadar(),
          dashboardService.getRecentAttempts()
        ]);

        setOverviewStats(overviewRes);
        setSkillsRadar(radarRes.data);
        setRecentAttempts(recentRes.data);
      } catch (error) {
        console.error("Failed to fetch chapter dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapterData();
  }, [chapter]);

  const handleNavigate = (nextChapter = chapter, nextMode = mode) => {
    if (nextMode === "all") {
      navigate(`/dashboard/chapter/${nextChapter}/all`);
    } else {
      navigate(`/dashboard/chapter/${nextChapter}`);
    }
  };

  if (loading || !overviewStats) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center border-t-4 border-[#003B62]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#003B62] mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 px-4  py-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-extrabold text-[#003B62]">
          {chapterName.toUpperCase()} DASHBOARD
        </h1>
        <select
          className="border rounded-full px-4 py-1 text-sm bg-white"
          value={mode}
          onChange={(e) => {
            const value = e.target.value;
            setMode(value);
            handleNavigate(chapter, value);
          }}
        >
          <option value="all">ภาพรวม</option>
          <option value="attempt1">ครั้งที่ 1</option>
        </select>
      </div>

      {/* top stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6 bg-white shadow-md p-4 rounded-3xl">
        <StatCard
          label="คะแนนเฉลี่ยรวม"
          value={overviewStats.averageScore}
          sub="(รวมทุกบท)"
          subClass="text-gray-500 text-xs mt-1"
        />
        <StatCard label="ระดับความเชี่ยวชาญ" value="ปานกลาง" />
        <StatCard
          label="จำนวนรอบที่ทำทั้งหมด"
          value={overviewStats.totalAttempts}
        />
        <StatCard label="จำนวนบท" value={overviewStats.totalChapters} />
      </div>

      {/* graphs row 1 */}

      <div className="grid grid-cols-3 gap-4 mb-4">
        <DashboardCard>
          {skillsRadar.length > 0 && (
            <RadarChartComponent
              data={skillsRadar}
              dataKey={chapter} // Use the current chapter as the data key (e.g. 'limit')
              angleKey="skill"
              fill="#3b82f6"
              height={280}
            />
          )}
        </DashboardCard>
        <div className="col-span-2">
          <DashboardCard title="กราฟพัฒนาการคะแนน">
            {recentAttempts.length > 0 ? (
              <LineChartComponent
                data={recentAttempts}
                dataKey="score"
                xAxisKey="date"
                stroke="#10b981"
              />
            ) : (
              <div className="h-[280px] flex items-center justify-center text-gray-400">ยังไม่มีข้อมูลการทำแบบทดสอบ</div>
            )}
          </DashboardCard>
        </div>
      </div>


      {/* graphs row 2 */}
      <div className="grid grid-cols-3 gap-4 mb-4 ">
        <div className="col-span-2 h-full">
          <DashboardCard title="กราฟเวลาเฉลี่ยต่อข้อ (วินาที)">
            {recentAttempts.length > 0 ? (
              <LineChartComponent
                data={recentAttempts}
                dataKey="avgTime"
                xAxisKey="date"
                stroke="#f59e0b"
              />
            ) : (
              <div className="h-[280px] flex items-center justify-center text-gray-400">ยังไม่มีข้อมูลการทำแบบทดสอบ</div>
            )}
          </DashboardCard>
        </div>

        <DashboardCard title="BLOOM'S LEVEL">
          <div className=" text-sm text-gray-700 space-y-2">

            <div className="space-y-2">
              {BLOOM_LEVELS.map((level) => (
                <BloomBar key={level.label} label={level.label} percent={level.percent} />
              ))}
            </div>

            <div className="mt-3 text-xs">
              <div>
                <h4 className="font-semibold mb-1">STRENGTHS</h4>
                <div className="flex gap-2 flex-wrap mb-2">
                  {CHAPTER_STRENGTHS.map((strength, idx) => (
                    <span
                      key={`${strength}-${idx}`}
                      className="px-2 py-1 bg-yellow-100 text-gray-600 rounded-full text-xs font-tiny"
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">WEAKNESSES</h4>
                <div className="flex gap-2 flex-wrap mb-2">
                  {CHAPTER_WEAKNESSES.map((weakness, idx) => (
                    <span
                      key={`${weakness}-${idx}`}
                      className="px-2 py-1 bg-blue-100 text-gray-600 rounded-full text-xs font-tiny"
                    >
                      {weakness}
                    </span>
                  ))}
                </div>
              </div>
              <div className="border text-gray-500 mt-4 px-3 py-2 rounded-lg text-xs">
                คำแนะนำ : พยายามฝึกทำแบบทดสอบในระดับที่สูงขึ้นเพื่อพัฒนาความเชี่ยวชาญในบทนี้ และเน้นทบทวนหัวข้อที่เป็นจุดอ่อนเพื่อเพิ่มคะแนนในรอบถัดไป
              </div>

            </div>
          </div>
        </DashboardCard>
      </div>

      {/* table */}
      <div className="mt-6">
        <h2 className="text-2xl font-semibold text-[#003B62] mb-3">
          รายละเอียดในการทำแบบทดสอบแต่ละครั้ง
        </h2>
        <DashboardCard>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">ครั้งที่</th>
                <th className="py-2 text-left">วันที่</th>
                <th className="py-2 text-left">คะแนน</th>
                <th className="py-2 text-left">เวลาต่อข้อ (วิ)</th>
              </tr>
            </thead>
            <tbody>
              {recentAttempts.length > 0 ? (
                recentAttempts.map((attempt, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">{attempt.attempt}</td>
                    <td className="py-2">{attempt.date}</td>
                    <td className="py-2">{attempt.score}%</td>
                    <td className="py-2">{attempt.avgTime}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">ยังไม่มีประวัติการทำแบบทดสอบ</td>
                </tr>
              )}
            </tbody>
          </table>
        </DashboardCard>
      </div>
    </div>
  );
}


