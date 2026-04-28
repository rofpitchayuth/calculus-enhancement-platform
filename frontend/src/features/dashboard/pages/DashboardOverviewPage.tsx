// src/features/dashboard/pages/DashboardOverviewPage.tsx

import { useState, useEffect, useMemo } from 'react';
import {
  RadarChartComponent,
  LineChartComponent,
  DashboardCard,
} from '../components';
import { dashboardService } from '../services/dashboard.service';
import type {
  OverviewStats,
  ChapterProgress,
  RadarChartData,
  LineChartData,
} from '../types/dashboard.type';

interface DashboardOverviewPageProps {
  userId?: number;
}

/**
 * Stat block แบบ inline (label เล็ก / value ใหญ่ / trend)
 * ใช้ตรง 3 ช่องบนขวาของหน้า Overview
 */
function InlineStat({
  label,
  value,
  trend,
  trendUnit = '',
  positiveIsGood = true,
}: {
  label: string;
  value: React.ReactNode;
  trend?: number;
  trendUnit?: string;
  positiveIsGood?: boolean;
}) {
  const showTrend = trend !== undefined && trend !== 0;
  const isGood = trend !== undefined ? (positiveIsGood ? trend > 0 : trend < 0) : true;
  const trendColor = isGood ? 'text-green-600' : 'text-red-500';
  const sign = trend !== undefined && trend > 0 ? '+' : '';

  return (
    <div className="bg-white rounded-2xl border px-4 py-3 flex flex-col">
      <span className="text-[11px] text-gray-500 mb-1">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-[#003B62]">{value}</span>
        {showTrend && (
          <span className={`text-xs font-semibold ${trendColor}`}>
            ({sign}
            {trend}
            {trendUnit})
          </span>
        )}
      </div>
    </div>
  );
}

export function DashboardOverviewPage({ userId = 1 }: DashboardOverviewPageProps) {
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [chapterProgressList, setChapterProgressList] = useState<ChapterProgress[]>([]);
  const [radarData, setRadarData] = useState<RadarChartData[]>([]);
  const [progressChartData, setProgressChartData] = useState<LineChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // TODO: Replace with API calls when backend is ready
        const overviewData = dashboardService.calculateOverviewStats(userId);
        setOverviewStats(overviewData);

        const progressData = dashboardService.getChapterProgressList(userId);
        setChapterProgressList(progressData);

        const radar = dashboardService.generateRadarChartData(userId);
        setRadarData(radar);

        // Mock weekly progress chart data — เปลี่ยนเป็น API call เมื่อพร้อม
        const mockProgressData: LineChartData[] = [
          { date: '1 มี.ค.', score: 65, avgTime: 45 },
          { date: '8 มี.ค.', score: 72, avgTime: 42 },
          { date: '15 มี.ค.', score: 78, avgTime: 40 },
          { date: '22 มี.ค.', score: 81, avgTime: 38 },
          { date: '29 มี.ค.', score: 85, avgTime: 35 },
        ];
        setProgressChartData(mockProgressData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  /**
   * จัดอันดับ strengths (top 3) / weaknesses (bottom 2-3) จากคะแนนของแต่ละบท
   */
  const { strengths, weaknesses } = useMemo(() => {
    const sorted = [...chapterProgressList].sort((a, b) => b.score - a.score);
    return {
      strengths: sorted.slice(0, 3),
      weaknesses: sorted.slice(-2).reverse(),
    };
  }, [chapterProgressList]);

  if (loading || !overviewStats) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#003B62]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-4">
      {/* Header */}
      <h1 className="text-4xl font-extrabold text-[#003B62] mb-6">
        PUNPUN'S DASHBOARD
      </h1>

      {/* Top Section: Radar (left) + 3 stats + S/W/Trend (right) */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Radar Chart */}
        <DashboardCard>
          {radarData.length > 0 && (
            <RadarChartComponent
              data={radarData}
              dataKey={userId.toString()}
              angleKey="skill"
              fill="#1D4ED8"
              height={320}
            />
          )}
        </DashboardCard>

        {/* Right side */}
        <div className="col-span-2 space-y-4">
          {/* 3 Inline Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4 bg-white shadow-md p-4 rounded-3xl">
            <InlineStat
              label="ระดับความเชี่ยวชาญรวม"
              value={overviewStats.proficiencyLevel}
            />
            <InlineStat
              label="คะแนนเฉลี่ยรวม"
              value={`${overviewStats.averageScore}%`}
              trend={5}
              positiveIsGood
            />
            <InlineStat
              label="เวลาเฉลี่ยต่อชุด"
              value="36 นาที"
              trend={-12}
              positiveIsGood={false}
            />
          </div>

          {/* 3-column section: Strengths / Weaknesses / Progress Trend */}
          <div className="bg-white rounded-2xl shadow-md p-5 grid grid-cols-3 gap-5">
            {/* Strengths */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-1">
                <span className="text-yellow-400">★</span> STRENGTHS
              </h4>
              <div className="flex flex-col gap-2">
                {strengths.map((c) => (
                  <div
                    key={c.chapter}
                    className="flex items-center justify-between bg-yellow-50 px-3 py-2 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">{c.chapter}</span>
                    <span className="text-sm font-semibold text-yellow-600">
                      {c.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-1">
                <span className="text-red-500">●</span> WEAKNESSES
              </h4>
              <div className="flex flex-col gap-2">
                {weaknesses.map((c) => (
                  <div
                    key={c.chapter}
                    className="flex items-center justify-between bg-red-50 px-3 py-2 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">{c.chapter}</span>
                    <span className="text-sm font-semibold text-red-500">
                      {c.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Trend */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">
                Progress Trend
              </h4>
              <div className="flex flex-col gap-2">
                <div className="bg-blue-50 px-3 py-2 rounded-lg text-xs text-gray-700 leading-relaxed">
                  คะแนนเฉลี่ยเพิ่มขึ้น{' '}
                  <span className="font-semibold text-green-600">+5%</span>{' '}
                  จากสัปดาห์ก่อน
                </div>
                <div className="bg-blue-50 px-3 py-2 rounded-lg text-xs text-gray-700 leading-relaxed">
                  เวลาทำแบบฝึกหัดลดลง{' '}
                  <span className="font-semibold text-green-600">12 นาที</span>{' '}
                  ต่อชุด
                </div>
                <div className="bg-blue-50 px-3 py-2 rounded-lg text-xs text-gray-700 leading-relaxed">
                  ความเข้าใจใน Integrate เพิ่มจาก{' '}
                  <span className="font-semibold">70% → 84%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Weekly Progress Chart */}
      <DashboardCard title="คะแนนเฉลี่ยในแต่ละสัปดาห์">
        {progressChartData.length > 0 ? (
          <LineChartComponent
            data={progressChartData}
            dataKey="score"
            xAxisKey="date"
            stroke="#1D4ED8"
            height={280}
          />
        ) : (
          <div className="h-[280px] flex items-center justify-center text-gray-400">
            ยังไม่มีข้อมูล
          </div>
        )}
      </DashboardCard>

      {/* Chapter Progress Table */}
      <h2 className="text-2xl font-semibold text-[#003B62] mb-3 mt-6">
        รายละเอียดสรุปแต่ละบท
      </h2>
      <DashboardCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="py-3 px-3 text-left font-semibold">บท</th>
                <th className="py-3 px-3 text-left font-semibold">
                  คะแนนเฉลี่ย
                </th>
                <th className="py-3 px-3 text-left font-semibold">
                  ระดับความเข้าใจ
                </th>
                <th className="py-3 px-3 text-left font-semibold">
                  เวลาต่อข้อ
                </th>
                <th className="py-3 px-3 text-left font-semibold">จุดเด่น</th>
                <th className="py-3 px-3 text-left font-semibold">
                  จุดที่ควรปรับปรุง
                </th>
              </tr>
            </thead>
            <tbody>
              {chapterProgressList.map((progress, idx) => (
                <tr
                  key={idx}
                  className={
                    idx === chapterProgressList.length - 1 ? '' : 'border-b'
                  }
                >
                  <td className="py-3 px-3 font-medium">{progress.chapter}</td>
                  <td className="py-3 px-3">{progress.score.toFixed(1)}%</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        progress.score >= 85
                          ? 'bg-green-100 text-green-800'
                          : progress.score >= 70
                          ? 'bg-blue-100 text-blue-800'
                          : progress.score >= 50
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {dashboardService.getProficiencyLevel(progress.score)}
                    </span>
                  </td>
                  <td className="py-3 px-3">{progress.avgTime.toFixed(1)} วิ</td>
                  <td className="py-3 px-3 text-gray-600">
                    {progress.score >= 70 ? (
                      <span className="px-2 py-1 bg-yellow-100 text-gray-700 rounded-full text-xs">
                        เข้าใจหลักการ
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-gray-600">
                    {progress.score < 70 ? (
                      <span className="px-2 py-1 bg-blue-100 text-gray-700 rounded-full text-xs">
                        ทบทวนพื้นฐาน
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
    </div>
  );
}
