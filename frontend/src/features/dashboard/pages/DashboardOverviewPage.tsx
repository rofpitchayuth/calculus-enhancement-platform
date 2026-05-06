// src/features/dashboard/pages/DashboardOverviewPage.tsx

import { useMemo } from 'react';
import { RadarChartComponent, LineChartComponent, DashboardCard } from '../components';
import { useDashboardOverview } from '../hooks/useDashboard';
import type { LineChartData } from '../types/dashboard.types';

interface DashboardOverviewPageProps {
  userId?: number;
}

/**
 * InlineStat
 * Local presentation component for dashboard metrics.
 */
function InlineStat({
  label, value, trend, trendUnit = '', positiveIsGood = true,
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
            ({sign}{trend}{trendUnit})
          </span>
        )}
      </div>
    </div>
  );
}

export function DashboardOverviewPage({ userId = 1 }: DashboardOverviewPageProps) {
  const { 
    overviewStats, 
    chapterList, 
    radarData, 
    recentAttempts, 
    loading, 
    error 
  } = useDashboardOverview();

  // --- Data Transformations (Presentation Logic) ---

  const progressChartData: LineChartData[] = useMemo(
    () => recentAttempts.map((a) => ({
      name:    a.date,
      score:   a.score,
      avgTime: a.avgTime ?? 0,
    })),
    [recentAttempts],
  );

  const { strengths, weaknesses } = useMemo(() => {
    const sorted = [...chapterList].sort((a, b) => b.score - a.score);
    return { 
      strengths: sorted.slice(0, 3), 
      weaknesses: sorted.slice(-2).reverse() 
    };
  }, [chapterList]);

  const radarChartData = useMemo(
    () => radarData.map((r) => ({
      skill: r.skill,
      [userId.toString()]: Math.round((r.limit + r.differential + r.integral) / 3),
    })),
    [radarData, userId],
  );

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#003B62]" />
      </div>
    );
  }

  if (error || !overviewStats) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <p className="text-red-500 font-semibold mb-2">Error Loading Dashboard</p>
          <p className="text-gray-600 text-sm">{error || 'Data could not be retrieved.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-4">
      <h1 className="text-4xl font-extrabold text-[#003B62] mb-6">
        PUNPUN'S DASHBOARD
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Radar Chart Section */}
        <DashboardCard>
          {radarChartData.length > 0 && (
            <RadarChartComponent
              data={radarChartData}
              dataKey={userId.toString()}
              angleKey="skill"
              fill="#1D4ED8"
              height={320}
            />
          )}
        </DashboardCard>

        {/* Stats Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 bg-white shadow-md p-4 rounded-3xl">
            <InlineStat label="ระดับความเชี่ยวชาญรวม" value={overviewStats.studentProfile} />
            <InlineStat label="คะแนนเฉลี่ยรวม"        value={overviewStats.averageScore} />
            <InlineStat label="จำนวนรอบที่ทำทั้งหมด"  value={overviewStats.totalAttempts} />
          </div>

          <div className="bg-white rounded-2xl shadow-md p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-1">
                <span className="text-yellow-400">★</span> STRENGTHS
              </h4>
              <div className="flex flex-col gap-2">
                {strengths.map((c) => (
                  <div key={c.chapter} className="flex items-center justify-between bg-yellow-50 px-3 py-2 rounded-lg">
                    <span className="text-sm text-gray-700">{c.chapter}</span>
                    <span className="text-sm font-semibold text-yellow-600">{c.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-1">
                <span className="text-red-500">●</span> WEAKNESSES
              </h4>
              <div className="flex flex-col gap-2">
                {weaknesses.map((c) => (
                  <div key={c.chapter} className="flex items-center justify-between bg-red-50 px-3 py-2 rounded-lg">
                    <span className="text-sm text-gray-700">{c.chapter}</span>
                    <span className="text-sm font-semibold text-red-500">{c.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Progress Trend</h4>
              <div className="flex flex-col gap-2">
                <div className="bg-blue-50 px-3 py-2 rounded-lg text-xs text-gray-700 leading-relaxed">
                  Mastery Score:{' '}
                  <span className="font-semibold text-green-600">
                    {(overviewStats.avgMastery * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="bg-blue-50 px-3 py-2 rounded-lg text-xs text-gray-700 leading-relaxed">
                  Profile: <span className="font-semibold">{overviewStats.studentProfile}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      <DashboardCard title="คะแนนในแต่ละรอบที่ทำ">
        {progressChartData.length > 0 ? (
          <LineChartComponent data={progressChartData} dataKey="score" xAxisKey="name" stroke="#1D4ED8" height={280} />
        ) : (
          <div className="h-[280px] flex items-center justify-center text-gray-400">ยังไม่มีข้อมูล</div>
        )}
      </DashboardCard>

      <h2 className="text-2xl font-semibold text-[#003B62] mb-3 mt-6">รายละเอียดสรุปแต่ละบท</h2>
      
      {/* Attempts Table */}
      <DashboardCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="py-3 px-3 text-left font-semibold">ครั้งที่</th>
                <th className="py-3 px-3 text-left font-semibold">วันที่</th>
                <th className="py-3 px-3 text-left font-semibold">คะแนน</th>
                <th className="py-3 px-3 text-left font-semibold">เวลาต่อข้อ</th>
                <th className="py-3 px-3 text-left font-semibold">จุดเด่น</th>
                <th className="py-3 px-3 text-left font-semibold">จุดที่ควรปรับปรุง</th>
              </tr>
            </thead>
            <tbody>
              {recentAttempts.map((a, idx) => (
                <tr key={idx} className={idx < recentAttempts.length - 1 ? 'border-b' : ''}>
                  <td className="py-3 px-3">{a.attempt}</td>
                  <td className="py-3 px-3">{a.date}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      a.score >= 80 ? 'bg-green-100 text-green-800'
                      : a.score >= 60 ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                      {a.score}%
                    </span>
                  </td>
                  <td className="py-3 px-3">{a.avgTime ?? '-'} วิ</td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1 flex-wrap">
                      {a.strengths.length > 0
                        ? a.strengths.map((s, i) => (
                            <span key={i} className="px-2 py-1 bg-yellow-100 text-gray-700 rounded-full text-xs">{s}</span>
                          ))
                        : <span className="text-gray-400 text-xs">-</span>}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1 flex-wrap">
                      {a.weaknesses.length > 0
                        ? a.weaknesses.map((w, i) => (
                            <span key={i} className="px-2 py-1 bg-blue-100 text-gray-700 rounded-full text-xs">{w}</span>
                          ))
                        : <span className="text-gray-400 text-xs">-</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );
}
