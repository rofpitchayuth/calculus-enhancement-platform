import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StatCard, DashboardCard, BloomBar, LineChartComponent } from '../components';
import { useChapterStats } from '../hooks/useDashboard';
import type { SkillTagMastery, BloomLevel } from '../types/dashboard.types';
import char1 from '../components/Excellent.png'
import char2 from '../components/Good.png'
import char3 from '../components/Developing.png'
import char4 from '../components/Beginner.png'

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

function generateBloomInsights(bloomLevels: BloomLevel[]): string | null {
  if (!bloomLevels || bloomLevels.length === 0) return null;

  const map = new Map<string, BloomLevel>();
  bloomLevels.forEach(b => map.set(b.label, b));

  const remembering = map.get("Remembering");
  const understanding = map.get("Understanding");
  const applying = map.get("Applying");
  const analyzing = map.get("Analyzing");
  const evaluating = map.get("Evaluating");
  const creating = map.get("Creating");

  const hasData = (level?: BloomLevel) => level && level.total_attempts > 0;
  const isGood = (level?: BloomLevel) => hasData(level) && level!.accuracy >= 65; // เกณฑ์ทำได้ดี
  const isWeak = (level?: BloomLevel) => hasData(level) && level!.accuracy <= 50; // เกณฑ์ที่ต้องระวัง

  if (isGood(analyzing) && (isWeak(applying) || isWeak(understanding))) {
    return "⚠️ ข้อสังเกต: นักเรียนสามารถวิเคราะห์โจทย์ได้ (Analyzing) แต่กลับมีปัญหาในการคำนวณ (Applying) หรือความเข้าใจพื้นฐาน อาจเกิดจากความสะเพร่าในขั้นตอนการทำ แนะนำให้ตรวจสอบการทดเลขหรือทบทวนพื้นฐาน";
  }

  if (isGood(applying) && (isWeak(understanding) || isWeak(remembering))) {
    return "⚠️ ข้อสังเกต: นักเรียนจำสูตรและคำนวณได้ดี (Applying) แต่ยังขาดความเข้าใจในนิยามหรือทฤษฎี (Understanding) หากเจอโจทย์พลิกแพลงอาจทำไม่ได้ แนะนำให้ทบทวนที่มาของสูตรเพิ่มเติม";
  }

  if ((isGood(remembering) || isGood(understanding)) && isWeak(applying)) {
    return "💡 ข้อแนะนำ: นักเรียนมีความเข้าใจทฤษฎีและนิยาม (Understanding) แต่ยังนำไปประยุกต์ใช้ในการแก้โจทย์ไม่ได้ (Applying) แนะนำให้ฝึกทำโจทย์คำนวณให้หลากหลายขึ้น";
  }

  if (isGood(applying) && isWeak(analyzing)) {
    return "💡 ข้อแนะนำ: นักเรียนมีทักษะการคำนวณที่มั่นคง (Applying) แต่ยังต้องการการฝึกฝนทักษะการตีความและวิเคราะห์โจทย์ที่ซับซ้อน (Analyzing) แนะนำให้ฝึกทำโจทย์ปัญหาเพิ่มเติม";
  }

  const activeLevels = bloomLevels.filter(b => b.total_attempts >= 3);
  if (activeLevels.length >= 3 && activeLevels.every(b => b.accuracy >= 70)) {
    return "🌟 ยอดเยี่ยม: นักเรียนมีทักษะและความเข้าใจตามลำดับขั้นของ Bloom เป็นอย่างดีเยี่ยม แนะนำให้ท้าทายด้วยโจทย์ระดับวิเคราะห์ขั้นสูง (Evaluating/Creating) ต่อไป";
  }

  for (const b of bloomLevels) {
    if (b.accuracy === 100 && b.total_attempts > 0 && b.total_attempts <= 2) {
      return `💡 ข้อมูลในระดับ ${b.label} ยังมีจำนวนน้อย (ทำไป ${b.total_attempts} ข้อ) แนะนำให้ฝึกโจทย์ในระดับนี้เพิ่มเติมเพื่อการวิเคราะห์ที่แม่นยำขึ้น`;
    }
  }

  return null;
}

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
      latestScore: last.score,
      scoreTrend: prev ? Math.round(last.score - prev.score) : 0,
      latestAvgTime: last.avgTime,
      timeTrend: prev ? Math.round(last.avgTime - prev.avgTime) : 0,
    };
  }, [attempts]);

  const progressChartData = useMemo(
    () => attempts.map((a) => ({
      attempt: `ครั้งที่ ${a.attempt}`,
      score: a.score,
      avgTime: a.avgTime,
    })),
    [attempts],
  );

  // --- Filtered Mastery Logic ---
  // Strength: top 3 with accuracy > 50%
  // Weakness: top 3 with accuracy < 50%
  const { filteredStrengths, filteredWeaknesses } = useMemo(() => {
    if (!stats) return { filteredStrengths: [], filteredWeaknesses: [] };

    // Combine all skills from both to get the full set
    const allSkills = [...stats.strengths, ...stats.weaknesses];
    
    // De-duplicate by skill_tag (just in case they overlap in the source)
    const uniqueSkillsMap = new Map<string, SkillTagMastery>();
    allSkills.forEach(s => {
      if (!uniqueSkillsMap.has(s.skill_tag)) {
        uniqueSkillsMap.set(s.skill_tag, s);
      }
    });
    const uniqueSkills = Array.from(uniqueSkillsMap.values());

    const strengths = uniqueSkills
      .filter((s) => s.accuracy > 50)
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 3);

    const weaknesses = uniqueSkills
      .filter((s) => s.accuracy < 50)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);

    return { filteredStrengths: strengths, filteredWeaknesses: weaknesses };
  }, [stats]);


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
        {/* Left Column: Chart + Strengths/Weaknesses */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <DashboardCard title="กราฟเวลาเฉลี่ยต่อข้อ (วินาที)">
            {progressChartData.length > 0 ? (
              <LineChartComponent data={progressChartData} dataKey="avgTime" xAxisKey="attempt" stroke="#1D4ED8" height={260} />
            ) : (
              <div className="h-[260px] flex items-center justify-center text-gray-400">ยังไม่มีข้อมูล</div>
            )}
          </DashboardCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DashboardCard>
              <h4 className="font-bold text-sm text-gray-700 mb-3 uppercase flex items-center gap-1.5 border-b pb-2">
                <span className="text-yellow-500 text-base">★</span>STRENGTHS
              </h4>
              <div className="flex flex-col gap-2 mt-2">
                {filteredStrengths.length > 0 ? filteredStrengths.map((s) => (
                  <div key={s.skill_tag} className="flex items-center justify-between bg-yellow-50 px-3 py-2 rounded-xl border border-yellow-100 shadow-sm">
                    <span className="text-xs text-gray-700 font-bold capitalize">
                      {s.skill_tag.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-yellow-600">{s.accuracy}%</span>
                      <span className="text-[10px] text-gray-400 font-bold">({s.attempt_count}x)</span>
                    </div>
                  </div>
                )) : <p className="text-xs text-gray-400 italic text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">ยังไม่มีข้อมูล</p>}
              </div>
            </DashboardCard>

            <DashboardCard>
              <h4 className="font-bold text-sm text-gray-700 mb-3 uppercase flex items-center gap-1.5 border-b pb-2">
                <span className="text-red-500 text-base">●</span>WEAKNESSES
              </h4>
              <div className="flex flex-col gap-2 mt-2">
                {filteredWeaknesses.length > 0 ? filteredWeaknesses.map((w) => (
                  <div key={w.skill_tag} className="flex items-center justify-between bg-red-50 px-3 py-2 rounded-xl border border-red-100 shadow-sm">
                    <span className="text-xs text-gray-700 font-bold capitalize">
                      {w.skill_tag.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-red-500">{w.accuracy}%</span>
                      <span className="text-[10px] text-gray-400 font-bold">({w.attempt_count}x)</span>
                    </div>
                  </div>
                )) : <p className="text-xs text-gray-400 italic text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">ยังไม่มีข้อมูล</p>}
              </div>
            </DashboardCard>
          </div>
        </div>

        {/* Right Column: Bloom's Level & Insights */}
        <DashboardCard title="BLOOM'S LEVEL & INSIGHTS">
          <div className="space-y-4">
            <div className="space-y-2">
              {stats.bloomLevels.map((level) => (
                <BloomBar key={level.label} {...level} />
              ))}
            </div>

            {/* Smart Insights Component */}
            {(() => {
              const insight = generateBloomInsights(stats.bloomLevels);
              if (!insight) return null;
              
              const isWarning = insight.startsWith("⚠️");
              const isInfo = insight.startsWith("💡");
              const isSuccess = insight.startsWith("🌟");

              return (
                <div className={`mt-4 p-3 rounded-xl border text-xs leading-relaxed font-medium ${
                  isWarning ? "bg-orange-50 border-orange-200 text-orange-800" :
                  isInfo ? "bg-blue-50 border-blue-200 text-blue-800" :
                  isSuccess ? "bg-green-50 border-green-200 text-green-800" :
                  "bg-gray-50 border-gray-200 text-gray-800"
                }`}>
                  {insight}
                </div>
              );
            })()}
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
                const strengthObj = filteredStrengths[idx % Math.max(filteredStrengths.length, 1)];
                const weaknessObj = filteredWeaknesses[idx % Math.max(filteredWeaknesses.length, 1)];
                
                const strengthLabel = strengthObj && typeof strengthObj !== 'string' ? strengthObj.skill_tag.replace(/_/g, ' ') : (strengthObj || '-');
                const weaknessLabel = weaknessObj && typeof weaknessObj !== 'string' ? weaknessObj.skill_tag.replace(/_/g, ' ') : (weaknessObj || '-');

                return (
                  <tr key={idx} className={idx < attempts.length - 1 ? 'border-b' : ''}>
                    <td className="py-3 px-3">{attempt.attempt}</td>
                    <td className="py-3 px-3">{attempt.date}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${attempt.score >= 80 ? 'bg-green-100 text-green-800'
                          : attempt.score >= 60 ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {attempt.score.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3">{attempt.avgTime} วิ</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-1 bg-yellow-100 text-gray-700 rounded-full text-xs capitalize">{String(strengthLabel)}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-1 bg-blue-100 text-gray-700 rounded-full text-xs capitalize">{String(weaknessLabel)}</span>
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
