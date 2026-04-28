// src/features/dashboard/pages/CourseReportPage.tsx

import { useState, useEffect } from 'react';
import {
  DashboardCard,
  DonutChartComponent,
} from '../components';
import { dashboardService } from '../services/dashboard.service';
import type {
  CourseReportData,
  DonutChartData,
} from '../types/dashboard.type';

interface CourseReportPageProps {
  sessionId?: number;
  attemptId?: number;
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
  'differential': 'Differential',
};

/**
 * แสดง difficulty rating เป็นดาว
 * (TODO: เมื่อ service ส่ง difficulty มาแล้วให้รับเข้ามาเป็น prop)
 */
function DifficultyStars({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1  bg-white px-3 py-1 rounded-full shadow-sm"> 
      <span className="text-xs text-gray-600 mr-1">ระดับความยาก</span>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={i <= level ? 'text-yellow-400' : 'text-gray-300'}
        >
          ★
        </span>
      ))}
    </div>
  );
}

/**
 * แปลงค่า accuracy → label ภาษาไทยสำหรับ skill breakdown
 */
function accuracyToLabel(accuracy: number): { label: string; color: string } {
  if (accuracy >= 85) return { label: 'ดีมาก', color: 'text-green-600' };
  if (accuracy >= 70) return { label: 'ดี', color: 'text-blue-600' };
  if (accuracy >= 50) return { label: 'ปานกลาง', color: 'text-yellow-600' };
  return { label: 'ควรปรับปรุง', color: 'text-red-500' };
}

export function CourseReportPage({
  sessionId = 1,
  userId = 1,
  mode = 'attempt1',
  setMode = () => { },
}: CourseReportPageProps) {
  const [report, setReport] = useState<CourseReportData | null>(null);
  const [scoreDistribution, setScoreDistribution] = useState<DonutChartData[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);

        // TODO: Replace with API calls when backend is ready
        const reportData = dashboardService.generateCourseReport(
          sessionId,
          userId
        );
        setReport(reportData);

        const scoreData = dashboardService.generateScoreDistributionData(
          sessionId,
          userId
        );
        setScoreDistribution(scoreData);
      } catch (error) {
        console.error('Failed to fetch report data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [sessionId, userId]);

  if (loading || !report) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#003B62]"></div>
      </div>
    );
  }

  const chapterName = CHAPTERS_MAP[report.chapterId] || report.chapterId;
  const accuracy = Math.round(
    (report.correctAnswers / report.totalQuestions) * 100
  );

  // TODO: difficulty ควรมาจาก report (เมื่อ backend พร้อม)
  const difficultyLevel = 4;

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-4">
      {/* Mode Selector ตรงกลางบน */}
      <div className="flex justify-center mb-2">
        <select
          className="border rounded-full px-4 py-1 text-sm bg-white shadow-sm"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="attempt1">Dashboard การทำแบบทดสอบครั้งที่ 1</option>
          <option value="attempt2">Dashboard การทำแบบทดสอบครั้งที่ 2</option>
          <option value="attempt3">Dashboard การทำแบบทดสอบครั้งที่ 3</option>
        </select>
      </div>

      {/* Title + Difficulty Stars */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-extrabold text-[#003B62]">
          {chapterName.toUpperCase()} DASHBOARD
        </h1>
        <DifficultyStars level={difficultyLevel} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Left: BIG Donut */}
        <DashboardCard>
          <div className="flex items-center justify-center h-full">
            <DonutChartComponent
              data={scoreDistribution}
              centerLabel={`${accuracy}`}
              centerLabelClassName="text-7xl font-extrabold text-[#003B62]"
              showLegend={false}
              height={360}
            />
          </div>
        </DashboardCard>

        {/* Right: stats + chips + skill breakdown */}
        <div className="space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-2 mb-4 bg-white shadow-md p-4 rounded-3xl">
            <div className="bg-white rounded-2xl  px-5 py-4 border">
              <p className="text-xs text-gray-500 mb-1">ระดับความเชี่ยวชาญ</p>
              <p className="text-2xl font-bold text-[#003B62]">
                {dashboardService.getProficiencyLevel(accuracy)}
              </p>
            </div>
            <div className="bg-white rounded-2xl  px-5 py-4 border">
              <p className="text-xs text-gray-500 mb-1">เวลาเฉลี่ยต่อข้อ</p>
              <p className="text-2xl font-bold text-[#003B62]">
                {report.avgTimePerQuestion} วินาที
              </p>
            </div>
          </div>

          {/* Strengths / Weaknesses chips */}
          <div className="bg-white rounded-2xl shadow-md p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xs font-bold text-gray-700 w-24 mt-1">
                STRENGTHS
              </span>
              <div className="flex gap-2 flex-wrap flex-1">
                {report.strengths.map((s, idx) => (
                  <span
                    key={`${s}-${idx}`}
                    className="px-3 py-1 bg-yellow-100 text-gray-700 rounded-full text-xs font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-xs font-bold text-gray-700 w-24 mt-1">
                WEAKNESSES
              </span>
              <div className="flex gap-2 flex-wrap flex-1">
                {report.weaknesses.map((w, idx) => (
                  <span
                    key={`${w}-${idx}`}
                    className="px-3 py-1 bg-blue-100 text-gray-700 rounded-full text-xs font-medium"
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Skill Breakdown */}
          <div className="bg-white rounded-2xl shadow-md p-4">
            <h4 className="font-semibold text-gray-700 mb-3 text-left">
              คะแนนในแต่ละทักษะ
            </h4>
            <div className="space-y-3">
              {report.skillBreakdown.map((skill) => {
                const { label, color } = accuracyToLabel(skill.accuracy);
                return (
                  <div key={skill.skill}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700 font-medium">
                        {skill.skill}
                      </span>
                      <span className={`text-xs font-semibold ${color}`}>
                        {label}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${skill.accuracy}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Error Analysis Table */}
      <h2 className="text-2xl font-semibold text-[#003B62] mb-3">
        ตารางข้อผิดพลาด (ERROR ANALYSIS)
      </h2>
      <DashboardCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="py-3 px-3 text-left font-semibold w-16">ข้อ</th>
                <th className="py-3 px-3 text-left font-semibold">โจทย์</th>
                <th className="py-3 px-3 text-left font-semibold">
                  จำนวนข้อผิด
                </th>
                <th className="py-3 px-3 text-left font-semibold">
                  อัตราข้อผิด
                </th>
                <th className="py-3 px-3 text-left font-semibold">
                  คำอธิบาย / คำแนะนำ
                </th>
              </tr>
            </thead>
            <tbody>
              {report.errorAnalysis.length > 0 ? (
                report.errorAnalysis.map((error) => (
                  <tr key={error.id} className="border-b last:border-b-0">
                    <td className="py-3 px-3">{error.id}</td>
                    <td className="py-3 px-3 font-medium text-gray-700">
                      {error.topic}
                    </td>
                    <td className="py-3 px-3">{error.errorCount} ข้อ</td>
                    <td className="py-3 px-3">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                        {error.errorRate}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-700 text-xs">
                      {error.suggestion}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-gray-500"
                  >
                    ยังไม่มีข้อผิดพลาด
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      {/* "ดูข้อสอบ" Button */}
      <button
        type="button"
        className="mt-6 w-full bg-yellow-300 hover:bg-yellow-400 transition-colors text-gray-800 font-semibold py-3 rounded-2xl shadow-md flex items-center justify-center gap-2"
      >
        ดูข้อสอบ
        <span className="text-xs">▼</span>
      </button>
    </div>
  );
}
