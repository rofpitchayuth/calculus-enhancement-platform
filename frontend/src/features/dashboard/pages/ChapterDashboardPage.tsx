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
    <div className="min-h-screen bg-blue-50 px-4  py-4"> 
    <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-extrabold text-[#003B62]">
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
      <div className="grid grid-cols-4 gap-4 mb-6 bg-white shadow-md p-4 rounded-3xl">
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

      <div className="grid grid-cols-3 gap-4 mb-4">
        <DashboardCard>
          <RadarChartComponent
            data={CHAPTER_SKILLS_RADAR}
            dataKey="value"
            angleKey="skill"
            fill="#3b82f6"
            height={280}
          />
        </DashboardCard>
        <div className="col-span-2">
        <DashboardCard title="กราฟพัฒนาการคะแนน">
          <LineChartComponent
            data={CHAPTER_SCORE_HISTORY}
            dataKey="score"
            xAxisKey="date"
            stroke="#10b981"
          />
        </DashboardCard>
        </div>
      </div>


      {/* graphs row 2 */}
      <div className="grid grid-cols-3 gap-4 mb-4 ">
        <div className="col-span-2 h-full">
        <DashboardCard title="กราฟเวลาเฉลี่ยต่อข้อ">
          <LineChartComponent
            data={CHAPTER_TIME_HISTORY}
            dataKey="avgTime"
            xAxisKey="date"
            stroke="#f59e0b"
          />
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


