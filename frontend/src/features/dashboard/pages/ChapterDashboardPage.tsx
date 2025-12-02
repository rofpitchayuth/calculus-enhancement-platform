// src/features/dashboard/pages/ChapterDashboardPage.tsx

import type { ChapterDashboardPageProps } from "../types/dashboard.type";
import { StatCard, DashboardCard, BloomBar, LineChartComponent, RadarChartComponent } from "../components";
import {
  CHAPTER_NAMES,
  CHAPTER_STATS,
  BLOOM_LEVELS,
  CHAPTER_STRENGTHS,
  CHAPTER_WEAKNESSES,
  CHAPTER_ATTEMPTS,
  CHAPTER_SCORE_HISTORY,
  CHAPTER_TIME_HISTORY,
  CHAPTER_SKILLS_RADAR,
} from "../data/mockData";

export function ChapterDashboardPage({ chapterId }: ChapterDashboardPageProps) {
  const chapterName =
    (chapterId && CHAPTER_NAMES[chapterId]) || "Differential";

  const stats = CHAPTER_STATS;

  return (
    <div className="min-h-screen bg-[#E8F4FF] px-10 py-8"> 
    <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-[#003B62]">
            {chapterName.toUpperCase()} DASHBOARD
        </h1>
        <select
            className="border rounded-full px-4 py-1 text-sm bg-white"
            defaultValue={chapterId || "differential"}
            onChange={(e) => {
            window.location.href = `/dashboard/chapter/${e.target.value}`;
            }}
        >
            <option value="differential">Differential</option>
            <option value="limit">Limits</option>
            <option value="integral">Integral</option>
        </select>
    </div>

      {/* top stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label="คะแนนล่าสุด"
          value={`${stats.latestScore}%`}
          sub={`(${stats.latestDiff > 0 ? "+" : ""}${stats.latestDiff})`}
          subClass={stats.latestDiff >= 0 ? "text-green-600" : "text-red-600"}
        />
        <StatCard label="ระดับความเชี่ยวชาญ" value={stats.difficulty} />
        <StatCard
          label="เวลาเฉลี่ยต่อข้อ"
          value={`${stats.avgTimePerQuestion} วินาที`}
          sub={`(${stats.avgTimeDiff > 0 ? "+" : ""}${stats.avgTimeDiff})`}
          subClass={stats.avgTimeDiff <= 0 ? "text-green-600" : "text-red-600"}
        />
        <StatCard label="จำนวนรอบที่ทำ" value={`${stats.totalRounds} รอบ`} />
      </div>

      {/* graphs row 1 */}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <DashboardCard>
          <RadarChartComponent
            data={CHAPTER_SKILLS_RADAR}
            dataKey="value"
            angleKey="skill"
            fill="#3b82f6"
            height={280}
          />
        </DashboardCard>

        <DashboardCard title="กราฟพัฒนาการคะแนน">
          <LineChartComponent
            data={CHAPTER_SCORE_HISTORY}
            dataKey="score"
            xAxisKey="date"
            stroke="#10b981"
            height={280}
          />
        </DashboardCard>
      </div>


      {/* graphs row 2 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <DashboardCard title="กราฟเวลาเฉลี่ยต่อข้อ">
          <LineChartComponent
            data={CHAPTER_TIME_HISTORY}
            dataKey="avgTime"
            xAxisKey="date"
            stroke="#f59e0b"
            height={280}
          />
        </DashboardCard>

        <DashboardCard title="BLOOM'S LEVEL">
          <div className="h-64 text-sm text-gray-700 space-y-2">
            <p className="text-xs text-gray-500">
              แสดงสัดส่วนระดับความรู้ เช่น Remember / Understand / Apply /
              Analyze / Evaluate
            </p>
            <div className="space-y-2">
              {BLOOM_LEVELS.map((level) => (
                <BloomBar key={level.label} label={level.label} percent={level.percent} />
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <h4 className="font-semibold mb-1">STRENGTHS</h4>
                <ul className="list-disc list-inside space-y-1">
                  {CHAPTER_STRENGTHS.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">WEAKNESSES</h4>
                <ul className="list-disc list-inside space-y-1">
                  {CHAPTER_WEAKNESSES.map((weakness, idx) => (
                    <li key={idx}>{weakness}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* table */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-[#003B62] mb-3">
          รายละเอียดในการทำแบบทดสอบแต่ละครั้ง
        </h2>
        <DashboardCard>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">ครั้งที่</th>
                <th className="py-2 text-left">วันที่</th>
                <th className="py-2 text-left">คะแนน</th>
                <th className="py-2 text-left">เวลาต่อข้อ</th>
                <th className="py-2 text-left">จุดเด่นที่ควรพัฒนา</th>
                <th className="py-2 text-left">จุดที่ควรปรับปรุง</th>
              </tr>
            </thead>
            <tbody>
              {/* ตัวอย่างแถวเดียว ไว้เปลี่ยนเป็น map data ภายหลัง */}
              {CHAPTER_ATTEMPTS.map((attempt, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2">{attempt.round}</td>
                  <td className="py-2">{attempt.date}</td>
                  <td className="py-2">{attempt.score}</td>
                  <td className="py-2">{attempt.avgTime}</td>
                  <td className="py-2">{attempt.strength}</td>
                  <td className="py-2">{attempt.weakness}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DashboardCard>
      </div>
    </div>
  );
}


