// src/features/dashboard/pages/CourseReportPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardCard, DonutChartComponent } from '../components';
import { dashboardService } from '../services/dashboard.service';
import { fetchSessionReport, fetchChapterSessions } from '../api/dashboard.api';
import type { SessionReport, ChapterSession } from '../api/dashboard.api';
import { QuizResultTable } from '../components/QuizResultTable';

// ── ตรงกับ topic IDs เดียวกับ ChapterDashboardPage ─────────────────────────
const CHAPTERS_MAP: Record<string, string> = {
  'limits_and_continuity': 'Limits & Continuity',
  'derivatives':            'Derivatives',
  'integrals':              'Integrals',
  'applications':           'Applications',
};

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


export function CourseReportPage() {
  // chapterId และ sessionId มาจาก URL: /dashboard/chapter/:chapterId/:sessionId
  const { chapterId = 'derivatives', sessionId: sessionIdParam } = useParams<{
    chapterId: string;
    sessionId: string;
  }>();
  const sessionId   = Number(sessionIdParam) || 0;
  const navigate    = useNavigate();
  const chapterName = CHAPTERS_MAP[chapterId] ?? chapterId;

  const [report, setReport]       = useState<SessionReport | null>(null);
  const [sessions, setSessions]   = useState<ChapterSession[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // ดึงพร้อมกัน: report ของ session นี้ + รายการ sessions ทั้งหมดของ topic
        const [reportData, sessionsRes] = await Promise.all([
          fetchSessionReport(sessionId),
          fetchChapterSessions(chapterId),   // ← ใช้ chapterId จาก URL ไม่ใช่จาก report
        ]);
        setReport(reportData);
        setSessions(sessionsRes.data);
      } catch (err) {
        console.error('Failed to fetch report data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [chapterId, sessionId]);

  if (loading || !report) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#003B62]" />
      </div>
    );
  }

  const accuracy       = Math.round((report.correctAnswers / report.totalQuestions) * 100);
  const difficultyLevel = 4;

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-4">

      {/* Dropdown — ภาพรวม / แต่ละ session */}
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

      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-extrabold text-[#003B62]">
          {chapterName.toUpperCase()} DASHBOARD
        </h1>
        <DifficultyStars level={difficultyLevel} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Donut */}
        <DashboardCard>
          <div className="flex items-center justify-center h-full">
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

        {/* Stats + Chips + Skill Breakdown */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 mb-4 bg-white shadow-md p-4 rounded-3xl">
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

          <div className="bg-white rounded-2xl shadow-md p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xs font-bold text-gray-700 w-24 mt-1">STRENGTHS</span>
              <div className="flex gap-2 flex-wrap flex-1">
                {report.strengths.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-yellow-100 text-gray-700 rounded-full text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xs font-bold text-gray-700 w-24 mt-1">WEAKNESSES</span>
              <div className="flex gap-2 flex-wrap flex-1">
                {report.weaknesses.map((w, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-100 text-gray-700 rounded-full text-xs font-medium">{w}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4">
            <h4 className="font-semibold text-gray-700 mb-3">คะแนนในแต่ละทักษะ</h4>
            <div className="space-y-3">
              {report.skillBreakdown.map((skill) => {
                const { label, color } = accuracyToLabel(skill.accuracy);
                return (
                  <div key={skill.skill}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700 font-medium">{skill.skill}</span>
                      <span className={`text-xs font-semibold ${color}`}>{label}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all" style={{ width: `${skill.accuracy}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Error Analysis */}
      <h2 className="text-2xl font-semibold text-[#003B62] mb-3">ตารางข้อผิดพลาด (ERROR ANALYSIS)</h2>
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

      {/* ดูข้อสอบ */}
      <button
        type="button"
        onClick={() => setShowTable(!showTable)}
        className="mt-6 w-full bg-yellow-300 hover:bg-yellow-400 transition-colors text-gray-800 font-semibold py-3 rounded-2xl shadow-md flex items-center justify-center gap-2"
      >
        ดูข้อสอบ <span className="text-xs">{showTable ? '▲' : '▼'}</span>
      </button>
      {showTable && (
      <QuizResultTable questions={report.quizQuestions ?? []} />
)}
    </div>
  );
}
