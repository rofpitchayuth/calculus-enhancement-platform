// src/features/dashboard/pages/ChapterDashboardPage.tsx

import { useState, useEffect, useMemo } from 'react';
import {
  StatCard,
  DashboardCard,
  BloomBar,
  LineChartComponent,
  RadarChartComponent,
} from '../components';
import { dashboardService } from '../services/dashboard.service';
import type {
  ChapterStats,
  AttemptRecord,
  RadarChartData,
  LineChartData,
} from '../types/dashboard.type';

interface ChapterDashboardPageProps {
  chapterId?: string;
  userId?: number;
  mode?: string;
  setMode?: (mode: string) => void;
}

const CHAPTERS_MAP: Record<string, string> = {
  'limits': 'Limits',
  'continuity': 'Continuity',
  'derivatives': 'Derivatives',
  'applications-derivatives': 'Applications of Derivatives',
  'integrals': 'Integrals',
  'applications-integrals': 'Applications of Integrals',
  // alias เผื่อใช้ key ภาษาไทย/อังกฤษอื่น ๆ
  'differential': 'Differential',
};

/**
 * แสดง trend indicator (+N) / (-N) ข้างค่า stat
 * positiveIsGood = true: ค่าขึ้นถือว่าดี (เขียว) → ใช้กับคะแนน
 * positiveIsGood = false: ค่าลงถือว่าดี (เขียว) → ใช้กับเวลา
 */
function TrendBadge({
  delta,
  positiveIsGood = true,
  unit = '',
}: {
  delta: number;
  positiveIsGood?: boolean;
  unit?: string;
}) {
  if (delta === 0) return null;

  const isGood = positiveIsGood ? delta > 0 : delta < 0;
  const color = isGood ? 'text-green-600' : 'text-red-500';
  const sign = delta > 0 ? '+' : '';

  return (
    <span className={`text-sm font-semibold ${color}`}>
      ({sign}
      {delta}
      {unit})
    </span>
  );
}

export function ChapterDashboardPage({
  chapterId = 'limits',
  userId = 1,
  mode = 'all',
  setMode = () => { },
}: ChapterDashboardPageProps) {
  const chapterName = CHAPTERS_MAP[chapterId] || 'Unknown';

  const [chapterStats, setChapterStats] = useState<ChapterStats | null>(null);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [radarData, setRadarData] = useState<RadarChartData[]>([]);
  const [progressChartData, setProgressChartData] = useState<LineChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapterData = async () => {
      try {
        setLoading(true);

        // TODO: Replace with API calls when backend is ready
        const statsData = dashboardService.calculateChapterStats(chapterId, userId);
        setChapterStats(statsData);

        const attemptsData = dashboardService.getChapterAttempts(chapterId, userId);
        setAttempts(attemptsData);

        const radar = dashboardService.generateRadarChartData(userId);
        setRadarData(radar);

        const progressData = dashboardService.generateProgressChartData(chapterId, userId);
        setProgressChartData(progressData);
      } catch (error) {
        console.error('Failed to fetch chapter data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapterData();
  }, [chapterId, userId]);

  /**
   * คำนวณ trend จาก attempts: เปรียบเทียบครั้งล่าสุดกับครั้งก่อนหน้า
   * (สมมติ attempts เรียงจากเก่า → ใหม่)
   */
  const { latestScore, scoreTrend, latestAvgTime, timeTrend } = useMemo(() => {
    if (attempts.length === 0) {
      return { latestScore: 0, scoreTrend: 0, latestAvgTime: 0, timeTrend: 0 };
    }

    const last = attempts[attempts.length - 1];
    const prev = attempts.length >= 2 ? attempts[attempts.length - 2] : null;

    return {
      latestScore: last.score,
      scoreTrend: prev ? Math.round(last.score - prev.score) : 0,
      latestAvgTime: last.avgTime,
      timeTrend: prev ? Math.round(last.avgTime - prev.avgTime) : 0,
    };
  }, [attempts]);

  if (loading || !chapterStats) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#003B62]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-4">
      {/* Mode Selector (อยู่ตรงกลางบน เหมือน mockup) */}
      <div className="flex justify-center mb-2">
        <select
          className="border rounded-full px-10 py-1 text-sm bg-white shadow-sm"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="all">Dashboard ภาพรวม {chapterName}</option>
          <option value="attempt1">ครั้งที่ 1</option>
          <option value="attempt2">ครั้งที่ 2</option>
          <option value="attempt3">ครั้งที่ 3</option>
        </select>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-extrabold text-[#003B62] mb-6">
        {chapterName.toUpperCase()} DASHBOARD
      </h1>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6 bg-white shadow-md p-4 rounded-3xl">
        <StatCard
          label="คะแนนล่าสุด"
          value={`${latestScore.toFixed(0)}%`}
          sub={
            scoreTrend !== 0 ? (
              <TrendBadge delta={scoreTrend} positiveIsGood unit="" />
            ) : undefined
          }
        />
        <StatCard
          label="ระดับความเชี่ยวชาญ"
          value={chapterStats.proficiencyLevel}
        />
        <StatCard
          label="เวลาเฉลี่ยต่อข้อ"
          value={`${Math.round(latestAvgTime || chapterStats.avgTimePerQuestion)} วินาที`}
          sub={
            timeTrend !== 0 ? (
              <TrendBadge delta={timeTrend} positiveIsGood={false} />
            ) : undefined
          }
        />
        <StatCard
          label="จำนวนรอบที่ทำ"
          value={`${chapterStats.totalAttempts} รอบ`}
        />
      </div>

      {/* Row 1: Radar + Progress Line */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <DashboardCard>
          {radarData.length > 0 && (
            <RadarChartComponent
              data={radarData}
              dataKey={userId.toString()}
              angleKey="skill"
              fill="#3b82f6"
              height={280}
            />
          )}
        </DashboardCard>

        <div className="col-span-2">
          <DashboardCard title="กราฟพัฒนาการคะแนน">
            {progressChartData.length > 0 ? (
              <LineChartComponent
                data={progressChartData}
                dataKey="score"
                xAxisKey="attempt"
                stroke="#1D4ED8"
                height={260}
              />
            ) : (
                <div className="h-[260px] flex items-center justify-center text-gray-400">
                  ยังไม่มีข้อมูล
                </div>
            )}
          </DashboardCard>
        </div>
      </div>

      {/* Row 2: Time Chart + Bloom Panel */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-2">
          <DashboardCard title="กราฟเวลาเฉลี่ยต่อข้อ (วินาที)">
            {progressChartData.length > 0 ? (
              <LineChartComponent
                data={progressChartData}
                dataKey="avgTime"
                xAxisKey="attempt"
                stroke="#1D4ED8"
                height={260}
              />
            ) : (
                <div className="h-[260px] flex items-center justify-center text-gray-400">
                  ยังไม่มีข้อมูล
                </div>
            )}
          </DashboardCard>
        </div>

        <DashboardCard title="BLOOM'S LEVEL">
          <div className="space-y-4">
            {/* Bloom Bars */}
            <div className="space-y-2">
              {chapterStats.bloomLevels.map((level) => (
                <BloomBar
                  key={level.label}
                  label={level.label}
                  percent={level.percent}
                />
              ))}
            </div>

            {/* Strengths */}
            <div className="border-t pt-3">
              <h4 className="font-semibold text-xs text-gray-700 mb-2">
                STRENGTHS
              </h4>
              <div className="flex gap-2 flex-wrap">
                {chapterStats.strengths.map((strength, idx) => (
                  <span
                    key={`${strength}-${idx}`}
                    className="px-2 py-1 bg-yellow-100 text-gray-700 rounded-full text-xs"
                  >
                    {strength}
                  </span>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div>
              <h4 className="font-semibold text-xs text-gray-700 mb-2">
                WEAKNESSES
              </h4>
              <div className="flex gap-2 flex-wrap">
                {chapterStats.weaknesses.map((weakness, idx) => (
                  <span
                    key={`${weakness}-${idx}`}
                    className="px-2 py-1 bg-blue-100 text-gray-700 rounded-full text-xs"
                  >
                    {weakness}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div className="border rounded-lg p-2 bg-gray-50 text-gray-600">
              <p className="text-xs leading-relaxed">
                ผู้เรียนปฏิบัติงานพื้นฐานและจำได้ในระดับดี
                (Remember–Understand สูง) แต่ยังไม่สามารถนำไปใช้ในโจทย์ที่ซับซ้อน
                (Apply ต่ำ) แนะนำให้ฝึกโจทย์ที่ใช้กฎหลายขั้นตอน
                เพื่อพัฒนาระดับ Analyze
              </p>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Attempts Table */}
      <h2 className="text-2xl font-semibold text-[#003B62] mb-3">
        รายละเอียดในการทำแบบทดสอบแต่ละครั้ง
      </h2>
      <DashboardCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="py-3 px-3 text-left font-semibold">ครั้งที่</th>
                <th className="py-3 px-3 text-left font-semibold">วันที่</th>
                <th className="py-3 px-3 text-left font-semibold">คะแนน</th>
                <th className="py-3 px-3 text-left font-semibold">เวลาต่อข้อ</th>
                <th className="py-3 px-3 text-left font-semibold">
                  จุดเด่นที่ควรพัฒนา
                </th>
                <th className="py-3 px-3 text-left font-semibold">
                  จุดที่ควรปรับปรุง
                </th>
              </tr>
            </thead>
            <tbody>
              {attempts.length > 0 ? (
                attempts.map((attempt, idx) => {
                  // เลือก strength/weakness แบบ rotate ต่อ row
                  // (ถ้าในอนาคต service ส่ง per-attempt data มาก็เปลี่ยนตรงนี้)
                  const strength =
                    chapterStats.strengths[
                    idx % Math.max(chapterStats.strengths.length, 1)
                    ] ?? '-';
                  const weakness =
                    chapterStats.weaknesses[
                    idx % Math.max(chapterStats.weaknesses.length, 1)
                    ] ?? '-';

                  return (
                    <tr
                      key={idx}
                      className={
                        idx === attempts.length - 1 ? '' : 'border-b'
                      }
                    >
                      <td className="py-3 px-3">{attempt.attempt}</td>
                      <td className="py-3 px-3">{attempt.date}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${attempt.score >= 80
                              ? 'bg-green-100 text-green-800'
                              : attempt.score >= 60
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {attempt.score.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-3">{attempt.avgTime} วิ</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 bg-yellow-100 text-gray-700 rounded-full text-xs">
                          {strength}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 bg-blue-100 text-gray-700 rounded-full text-xs">
                          {weakness}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-gray-500"
                    >
                      ยังไม่มีประวัติการทำแบบทดสอบ
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );
}
