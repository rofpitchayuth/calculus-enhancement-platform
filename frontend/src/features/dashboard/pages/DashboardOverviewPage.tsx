// src/features/dashboard/pages/DashboardOverviewPage.tsx

import { useMemo } from 'react';
import { RadarChartComponent, LineChartComponent, DashboardCard } from '../components';
import { useDashboardOverview } from '../hooks/useDashboard';
import type { LineChartData } from '../types/dashboard.types';
import char1 from '../components/character/LuckyGuessers.png'
import char2 from '../components/character/Careless.png'
import char3 from '../components/character/HighAchiever.png'
import char4 from '../components/character/Developing.png'
import char5 from '../components/character/Struggling.png'


const ImageMap: Record<string, string> = {
  "Lucky Guesser": char1,
  "Careless (High Slip)": char2,
  "High Achiever": char3,
  "Developing (Average)": char4,
  "Struggling": char5,
}

/**
 * StatusThaiMap
 * Maps English backend status enums to Thai display strings for the UI.
 */
const StatusThaiMap: Record<string, string> = {
  "Lucky Guesser": "นักเดามือทอง",
  "High Achiever": "ยอดฝีมือแคลคูลัส",
  "Careless": "นักสะดุดยอดหญ้า",
  "Careless (High Slip)": "นักสะดุดยอดหญ้า",
  "Developing": "นักสู้ผู้กำลังพัฒนา",
  "Developing (Average)": "นักสู้ผู้กำลังพัฒนา",
  "Struggling": "นักสู้(สู้ชีวิต)",
};

/**
 * getThaiStatus
 * Helper function to retrieve the Thai display string for a given status.
 */
const getThaiStatus = (status: string) => StatusThaiMap[status] || status;

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

/**
 * MasteryItem
 * Renders a single skill or sub-topic with its accuracy percentage.
 */
function MasteryItem({ item, labelColor }: { item: any; labelColor: string }) {
  return (
    <div className="flex flex-col bg-white border border-gray-100 p-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
      <span className="text-[13px] text-gray-800 font-bold leading-tight mb-1.5">
        {item.skill_tag.replace(/_/g, ' ')}
      </span>
      <div className="flex items-center gap-2 border-t border-gray-50 pt-1.5 mt-auto">
        <span className={`text-[12px] font-black ${labelColor}`}>
          {Math.round(item.accuracy)}%
        </span>
        <span className="text-[9px] text-gray-400 font-bold opacity-60">
          {item.attempt_count} attempts
        </span>
      </div>
    </div>
  );
}

/**
 * MasterySection
 * Renders a grouped view of Sub Topics and Skill Tags.
 */
function MasteryColumn({ title, items, labelColorClass, emptyMsg }: { 
  title: string; 
  items: any[]; 
  labelColorClass: string;
  emptyMsg: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="bg-white self-start px-2.5 py-1 rounded-lg border border-gray-100 mb-3 shadow-sm">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {items.length > 0 ? items.map((s: any) => (
          <MasteryItem key={s.skill_tag} item={s} labelColor={labelColorClass} />
        )) : (
          <div className="py-4 border border-dashed border-gray-100 rounded-xl flex items-center justify-center bg-gray-50/20">
            <span className="text-[10px] text-gray-400 italic">{emptyMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function MasterySection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2.5 px-1">
        <span className="flex items-center justify-center w-6 h-6 bg-white rounded-full shadow-sm text-xs border border-gray-100">{icon}</span>
        <span className="text-[13px] font-black text-[#003B62] uppercase tracking-[0.1em]">{title}</span>
      </div>
      <div className="grid grid-cols-2 gap-5 p-5 rounded-[36px] bg-gray-50/40 border border-gray-100/60 shadow-inner">
        {children}
      </div>
    </div>
  );
}

export function DashboardOverviewPage() {
  const {
    overviewStats,
    radarData,
    recentAttempts,
    skillMastery,
    loading,
    error
  } = useDashboardOverview();

  // --- Data Transformations (Presentation Logic) ---

  const progressChartData: LineChartData[] = useMemo(
    () => recentAttempts.map((a) => ({
      name: a.date,
      score: a.score,
      avgTime: a.avgTime ?? 0,
    })),
    [recentAttempts],
  );

  // Radar chart: each axis = cognitive skill; plotted value = avg accuracy across all 4 topics
  // Refactored to use the authentic 6 levels of Bloom's Taxonomy.
  const radarChartData = useMemo(() => {
    const baseSkills = [
      "Remembering",
      "Understanding",
      "Applying",
      "Analyzing",
      "Evaluating",
      "Creating"
    ];

    return baseSkills.map((skill) => {
      // Find the student's data for this specific Bloom's level
      const existingData = radarData.find((r) => r.skill === skill);

      if (existingData) {
        return {
          skill: existingData.skill,
          value: Math.round(
            (existingData.limit +
              existingData.differential +
              existingData.integral +
              existingData.applications) / 4
          ),
        };
      }

      // Fallback to 0 if no data exists for this Bloom's level (renders a hexagon pulling to 0)
      return { skill, value: 0 };
    });
  }, [radarData]);

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
    <div className="px-4 py-4">
      <h1 className="text-4xl font-extrabold text-[#003B62] mb-6">
        OVERVIEW DASHBOARD
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Radar Chart Section */}
        <DashboardCard title="Cognitive Skills Radar">
          {radarChartData.length > 0 ? (
            <RadarChartComponent
              data={radarChartData}
              dataKey="value"
              angleKey="skill"
              fill="#1D4ED8"
              height={300}
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">ยังไม่มีข้อมูล</div>
          )}
        </DashboardCard>

        {/* Stats Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 bg-white shadow-md p-4 rounded-3xl">
            <InlineStat label="ระดับความเชี่ยวชาญรวม" value={getThaiStatus(overviewStats.studentProfile)} />
            <InlineStat label="คะแนนเฉลี่ยรวม" value={overviewStats.averageScore} />
            <InlineStat label="จำนวนรอบที่ทำทั้งหมด" value={overviewStats.totalAttempts} />
          </div>

          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-6 lg:p-8 mb-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* STRENGTHS GROUP */}
              <MasterySection title="STRENGTHS" icon={<span className="text-yellow-400">★</span>}>
                <MasteryColumn 
                  title="Sub Topics"
                  items={(skillMastery.strengths?.subTopics || []).slice(0, 3)}
                  labelColorClass="text-yellow-600"
                  emptyMsg="No data"
                />
                <MasteryColumn 
                  title="Skill Tags"
                  items={(skillMastery.strengths?.skillTags || []).slice(0, 3)}
                  labelColorClass="text-yellow-600"
                  emptyMsg="No data"
                />
              </MasterySection>

              {/* WEAKNESSES GROUP */}
              <MasterySection title="WEAKNESSES" icon={<span className="text-red-500 text-[8px]">●</span>}>
                <MasteryColumn 
                  title="Sub Topics"
                  items={(skillMastery.weaknesses?.subTopics || []).slice(0, 3)}
                  labelColorClass="text-red-600"
                  emptyMsg="No data"
                />
                <MasteryColumn 
                  title="Skill Tags"
                  items={(skillMastery.weaknesses?.skillTags || []).slice(0, 3)}
                  labelColorClass="text-red-600"
                  emptyMsg="No data"
                />
              </MasterySection>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Chart */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <DashboardCard title="คะแนนในแต่ละรอบที่ทำ">
            {progressChartData.length > 0 ? (
              <LineChartComponent data={progressChartData} dataKey="score" xAxisKey="name" stroke="#1D4ED8" height={280} />
            ) : (
              <div className="h-[280px] flex items-center justify-center text-gray-400">ยังไม่มีข้อมูล</div>
            )}
          </DashboardCard>
        </div>
        <DashboardCard title={`Your Level : ${getThaiStatus(overviewStats.studentProfile)}`}>
          <img
            src={ImageMap[overviewStats.studentProfile]}
            alt={overviewStats.studentProfile}
            className="w-full h-auto"
          />
        </DashboardCard>
      </div>
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
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${a.score >= 80 ? 'bg-green-100 text-green-800'
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
                          <span key={i} className="px-2 py-1 bg-yellow-100 text-gray-700 rounded-full text-xs capitalize">
                            {s.replace(/_/g, ' ')}
                          </span>
                        ))
                        : <span className="text-gray-400 text-xs">-</span>}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1 flex-wrap">
                      {a.weaknesses.length > 0
                        ? a.weaknesses.map((w, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-gray-700 rounded-full text-xs capitalize">
                            {w.replace(/_/g, ' ')}
                          </span>
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
