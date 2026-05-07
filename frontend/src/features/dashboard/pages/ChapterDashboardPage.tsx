import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StatCard, DashboardCard, BloomBar, LineChartComponent } from '../components';
import { useChapterStats } from '../hooks/useDashboard';
import char1 from '../components/EXCELLENT.png' 
import char2 from '../components/GOOD.png' 
import char3 from '../components/DEVELOPING.png' 
import char4 from '../components/BEGINNER.png'
// --- Constants & Config ---

const CHAPTERS_MAP: Record<string, string> = {
  'LIMIT': 'LIMIT',
  'DIFFERENTIAL': 'DIFFERENTIAL',
  'INTEGRAL': 'INTEGRAL',
  'APPLICATIONS': 'APPLICATIONS',
};

const proficiencyImageMap: Record<string, string> = {
  Excellent: char1,
  Good: char2,
  Developing: char3,
  Beginner: char4,
}
// --- Local Presentation Components ---

function TrendBadge({ delta, positiveIsGood = true, unit = '' }: {
  delta: number; positiveIsGood?: boolean; unit?: string;
}) {
  if (delta === 0) return null;
  const isGood = positiveIsGood ? delta > 0 : delta < 0;
  return (
    <span className={`text-sm font-semibold ${isGood ? 'text-green-600' : 'text-red-500'}`}>
      ({delta > 0 ? '+' : ''}{delta}{unit})
    </span>
  );
}

export function ChapterDashboardPage() {
  const navigate = useNavigate();

  const { chapterId = 'LIMIT' } = useParams<{ chapterId: string }>();
  const chapterName = CHAPTERS_MAP[chapterId] ?? chapterId;

  const {
    stats,
    attempts,
    sessions,
    isLoading,
    error
  } = useChapterStats(chapterId);

  const { latestScore, scoreTrend, latestAvgTime, timeTrend } = useMemo(() => {
    if (attempts.length === 0) return { latestScore: 0, scoreTrend: 0, latestAvgTime: 0, timeTrend: 0 };
    const last = attempts[attempts.length - 1];
    const prev = attempts.length >= 2 ? attempts[attempts.length - 2] : null;
    return {
      latestScore:   last.score,
      scoreTrend:    prev ? Math.round(last.score - prev.score) : 0,
      latestAvgTime: last.avgTime,
      timeTrend:     prev ? Math.round(last.avgTime - prev.avgTime) : 0,
    };
  }, [attempts]);

  const progressChartData = useMemo(
    () => attempts.map((a) => ({
      attempt: `ครั้งที่ ${a.attempt}`,
      score:   a.score,
      avgTime: a.avgTime,
    })),
    [attempts],
  );

  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#003B62]" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <p className="text-red-500 font-semibold mb-2">Error Loading Chapter Stats</p>
          <p className="text-gray-600 text-sm">{error || 'Data could not be retrieved.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-4">

      {/* Navigation / Filter */}
      <div className="flex justify-center mb-2">
        <select
          className="border rounded-full px-10 py-1 text-sm bg-white shadow-sm"
          value="all"
          onChange={(e) => {
            const val = e.target.value;
            if (val !== 'all') navigate(`/dashboard/chapter/${chapterId}/${val}`);
          }}
        >
          <option value="all">ภาพรวม {chapterName}</option>
          {sessions.map((s) => (
            <option key={s.sessionId} value={s.sessionId}>
              ครั้งที่ {s.attempt} ({s.date})
            </option>
          ))}
        </select>
      </div>

      <h1 className="text-4xl font-extrabold text-[#003B62] mb-6 uppercase">
        {chapterName} DASHBOARD
      </h1>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 bg-white shadow-md p-4 rounded-3xl">
        <StatCard
          label="คะแนนล่าสุด"
          value={`${latestScore.toFixed(0)}%`}
          sub={scoreTrend !== 0 ? <TrendBadge delta={scoreTrend} positiveIsGood /> : undefined}
        />
        <StatCard label="ระดับความเชี่ยวชาญ" value={stats.proficiencyLevel} />
        <StatCard
          label="เวลาเฉลี่ยต่อข้อ"
          value={`${Math.round(latestAvgTime || stats.avgTimePerQuestion)} วินาที`}
          sub={timeTrend !== 0 ? <TrendBadge delta={timeTrend} positiveIsGood={false} /> : undefined}
        />
        <StatCard label="จำนวนรอบที่ทำ" value={`${stats.totalAttempts} รอบ`} />
      </div>

      {/* Visualization Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-1 flex items-center justify-center">
          <DashboardCard title={`Your Level : ${stats.proficiencyLevel}`}>
            <img
              src={proficiencyImageMap[stats.proficiencyLevel] ?? char4}
              alt={stats.proficiencyLevel}
              className="w-full h-auto"
            />
          </DashboardCard>
        </div>

        <div className="lg:col-span-2">
          <DashboardCard title="กราฟพัฒนาการคะแนน">
            {progressChartData.length > 0 ? (
              <LineChartComponent data={progressChartData} dataKey="score" xAxisKey="attempt" stroke="#1D4ED8" height={260} />
            ) : (
              <div className="h-[260px] flex items-center justify-center text-gray-400">ยังไม่มีข้อมูล</div>
            )}
          </DashboardCard>
        </div>
      </div>

      {/* Visualization Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <DashboardCard title="กราฟเวลาเฉลี่ยต่อข้อ (วินาที)">
            {progressChartData.length > 0 ? (
              <LineChartComponent data={progressChartData} dataKey="avgTime" xAxisKey="attempt" stroke="#1D4ED8" height={260} />
            ) : (
              <div className="h-[260px] flex items-center justify-center text-gray-400">ยังไม่มีข้อมูล</div>
            )}
          </DashboardCard>
        </div>
        <DashboardCard title="BLOOM'S LEVEL">
          <div className="space-y-4">
            <div className="space-y-2">
              {stats.bloomLevels.map((level) => (
                <BloomBar key={level.label} label={level.label} percent={level.percent} />
              ))}
            </div>
            <div className="border-t pt-3">
              <h4 className="font-semibold text-xs text-gray-700 mb-2 uppercase">Strengths</h4>
              <div className="flex gap-2 flex-wrap">
                {stats.strengths.map((s, i) => (
                  <span key={i} className="px-2 py-1 bg-yellow-100 text-gray-700 rounded-full text-xs">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-xs text-gray-700 mb-2 uppercase">Weaknesses</h4>
              <div className="flex gap-2 flex-wrap">
                {stats.weaknesses.map((w, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-100 text-gray-700 rounded-full text-xs">{w}</span>
                ))}
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* History Table */}
      <h2 className="text-2xl font-semibold text-[#003B62] mb-3">รายละเอียดในการทำแบบทดสอบแต่ละครั้ง</h2>
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
              {attempts.length > 0 ? attempts.map((attempt, idx) => {
                const strength = stats.strengths[idx % Math.max(stats.strengths.length, 1)] ?? '-';
                const weakness = stats.weaknesses[idx % Math.max(stats.weaknesses.length, 1)] ?? '-';
                return (
                  <tr key={idx} className={idx < attempts.length - 1 ? 'border-b' : ''}>
                    <td className="py-3 px-3">{attempt.attempt}</td>
                    <td className="py-3 px-3">{attempt.date}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        attempt.score >= 80 ? 'bg-green-100 text-green-800'
                        : attempt.score >= 60 ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                        {attempt.score.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3">{attempt.avgTime} วิ</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-1 bg-yellow-100 text-gray-700 rounded-full text-xs">{strength}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-1 bg-blue-100 text-gray-700 rounded-full text-xs">{weakness}</span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">ยังไม่มีประวัติการทำแบบทดสอบ</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );
}
