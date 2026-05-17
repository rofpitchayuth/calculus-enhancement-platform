// src/features/dashboard/pages/CourseReportPage.tsx

import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardCard, DonutChartComponent } from '../components';
import { dashboardService } from '../services/dashboard.service';
import { useSessionReport } from '../hooks/useDashboard';
import { QuizResultTable } from '../components/QuizResultTable';

// --- Constants & Config ---

const CHAPTERS_MAP: Record<string, string> = {
  'LIMIT':            'LIMIT',
  'DIFFERENTIAL':       'DIFFERENTIAL',
  'INTEGRAL':         'INTEGRAL',
  'APPLICATIONS':      'APPLICATIONS',
};

// --- Local Presentation Components ---

function DifficultyStars({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm">
      <span className="text-xs text-gray-600 mr-1">ระดับความยาก</span>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= level ? 'text-yellow-400' : 'text-gray-300'}>★</span>
      ))}
    </div>
  );
}

function accuracyToLabel(accuracy: number) {
  if (accuracy >= 85) return { label: 'ดีมาก',       color: 'text-green-600'  };
  if (accuracy >= 70) return { label: 'ดี',          color: 'text-blue-600'   };
  if (accuracy >= 50) return { label: 'ปานกลาง',     color: 'text-yellow-600' };
  return                     { label: 'ควรปรับปรุง', color: 'text-red-500'    };
}

// --- Main Page Component ---

export function CourseReportPage() {
  const navigate = useNavigate();
  
  // chapterId and sessionId from URL: /dashboard/chapter/:chapterId/:sessionId
  const { chapterId = 'derivatives', sessionId: sessionIdParam } = useParams<{
    chapterId: string;
    sessionId: string;
  }>();
  
  const sessionId = Number(sessionIdParam) || 0;
  const chapterName = CHAPTERS_MAP[chapterId] ?? chapterId;

  const {
    report,
    sessions,
    loading,
    error
  } = useSessionReport(chapterId, sessionId);

  const [showTable, setShowTable] = useState(false);

  const { parsedStrengths, parsedWeaknesses } = useMemo(() => {
    if (!report || !report.skillBreakdown) return { parsedStrengths: [], parsedWeaknesses: [] };

    // Strengths: accuracy > 50%, sorted descending, top 3
    const strengths = report.skillBreakdown
      .filter((s) => s.accuracy > 50)
      .map((s) => ({
        skill: s.skill,
        accuracy: Math.round(s.accuracy),
      }))
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 3);

    // Weaknesses: accuracy < 50%, sorted ascending, top 3
    const weaknesses = report.skillBreakdown
      .filter((s) => s.accuracy < 50)
      .map((s) => ({
        skill: s.skill,
        accuracy: Math.round(s.accuracy),
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);

    return { parsedStrengths: strengths, parsedWeaknesses: weaknesses };
  }, [report]);

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#003B62]" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <p className="text-red-500 font-semibold mb-2">Error Loading Session Report</p>
          <p className="text-gray-600 text-sm">{error || 'Data could not be retrieved.'}</p>
        </div>
      </div>
    );
  }

  const accuracy = Math.round((report.correctAnswers / report.totalQuestions) * 100);
  // Map 0.0–1.0 difficulty scale to 1–5 star rating
  const difficultyLevel = Math.max(1, Math.min(5, Math.round(report.avgDifficulty * 5)));

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-4">

      {/* Navigation Filter */}
      <div className="flex justify-center mb-2">
        <select
          className="border rounded-full px-10 py-1 text-sm bg-white shadow-sm"
          value={sessionId}
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'all') {
              navigate(`/dashboard/chapter/${chapterId}/all`);
            } else {
              navigate(`/dashboard/chapter/${chapterId}/${val}`);
            }
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

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-4xl font-extrabold text-[#003B62] uppercase">
          {chapterName} REPORT
        </h1>
        <DifficultyStars level={difficultyLevel} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Main Score Donut */}
        <DashboardCard>
          <div className="flex items-center justify-center h-full p-4">
            <DonutChartComponent
              data={report.scoreDistribution.map((item, i) => ({
                ...item,
                color: i === 0 ? '#3b82f6' : '#e5e7eb',
              }))}
              centerLabel={`${accuracy}`}
              centerLabelClassName="text-7xl font-extrabold text-[#003B62]"
              showLegend={false}
              height={360}
            />
          </div>
        </DashboardCard>

        {/* Breakdown Panel */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 bg-white shadow-md p-4 rounded-3xl">
            <div className="bg-white rounded-2xl px-5 py-4 border">
              <p className="text-xs text-gray-500 mb-1">ระดับความเชี่ยวชาญ</p>
              <p className="text-2xl font-bold text-[#003B62]">
                {dashboardService.getProficiencyLevel(accuracy)}
              </p>
            </div>
            <div className="bg-white rounded-2xl px-5 py-4 border">
              <p className="text-xs text-gray-500 mb-1">เวลาเฉลี่ยต่อข้อ</p>
              <p className="text-2xl font-bold text-[#003B62]">
                {report.avgTimePerQuestion} วินาที
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-5 space-y-4">
            <div>
              <h4 className="font-semibold text-xs text-gray-700 mb-3 uppercase flex items-center gap-1">
                <span className="text-yellow-500">★</span> STRENGTHS
              </h4>
              <div className="flex flex-col gap-2">
                {parsedStrengths.length > 0 ? parsedStrengths.slice(0, 3).map((s) => (
                  <div key={s.skill} className="flex items-center justify-between bg-yellow-50 px-3 py-2 rounded-xl border border-yellow-100 shadow-sm">
                    <span className="text-xs text-gray-700 font-medium capitalize">
                      {s.skill.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-black text-yellow-600">{s.accuracy}%</span>
                  </div>
                )) : <p className="text-xs text-gray-400 italic text-center py-2 bg-gray-50 rounded-xl border border-dashed border-gray-200">ยังไม่มีข้อมูล</p>}
              </div>
            </div>

            <div className="border-t pt-3">
              <h4 className="font-semibold text-xs text-gray-700 mb-3 uppercase flex items-center gap-1">
                <span className="text-red-500">●</span> WEAKNESSES
              </h4>
              <div className="flex flex-col gap-2">
                {parsedWeaknesses.length > 0 ? parsedWeaknesses.slice(0, 3).map((w) => (
                  <div key={w.skill} className="flex items-center justify-between bg-red-50 px-3 py-2 rounded-xl border border-red-100 shadow-sm">
                    <span className="text-xs text-gray-700 font-medium capitalize">
                      {w.skill.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-black text-red-500">{w.accuracy}%</span>
                  </div>
                )) : <p className="text-xs text-gray-400 italic text-center py-2 bg-gray-50 rounded-xl border border-dashed border-gray-200">ยังไม่มีข้อมูล</p>}
              </div>
            </div>
          </div>
          {/* Removed 'คะแนนในแต่ละทักษะ' section as requested */}
        </div>
      </div>

      {/* Error Analysis Table */}
      <h2 className="text-2xl font-semibold text-[#003B62] mb-3 uppercase">ตารางข้อผิดพลาด (Error Analysis)</h2>
      <div className="bg-white rounded-2xl shadow-md">
        <div className="overflow-x-auto rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="py-3 px-3 text-left font-semibold">ข้อ</th>
                <th className="py-3 px-3 text-left font-semibold">หัวข้อ</th>
                <th className="py-3 px-3 text-left font-semibold">จำนวนผิด</th>
                <th className="py-3 px-3 text-left font-semibold">อัตราผิด</th>
                <th className="py-3 px-3 text-left font-semibold">คำอธิบาย / คำแนะนำ</th>
              </tr>
            </thead>
            <tbody>
              {report.errorAnalysis.length > 0 ? report.errorAnalysis.map((error) => (
                <tr key={error.id} className="border-b last:border-b-0">
                  <td className="py-3 px-3">{error.id}</td>
                  <td className="py-3 px-3 font-medium text-gray-700">{error.topic}</td>
                  <td className="py-3 px-3">{error.errorCount} ข้อ</td>
                  <td className="py-3 px-3">{error.errorRate}</td>
                  <td className="py-3 px-3 text-gray-700 text-xs">{error.suggestion}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">ยังไม่มีข้อผิดพลาด</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Toggle */}
      <button
        type="button"
        onClick={() => setShowTable(!showTable)}
        className="mt-6 w-full bg-yellow-300 hover:bg-yellow-400 transition-colors text-gray-800 font-semibold py-3 rounded-2xl shadow-md flex items-center justify-center gap-2"
      >
        {showTable ? 'ซ่อนรายละเอียดข้อสอบ' : 'ดูรายละเอียดข้อสอบทั้งหมด'} 
        <span className="text-xs">{showTable ? '▲' : '▼'}</span>
      </button>
      
      {showTable && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <QuizResultTable questions={report.quizQuestions ?? []} />
        </div>
      )}
    </div>
  );
}
