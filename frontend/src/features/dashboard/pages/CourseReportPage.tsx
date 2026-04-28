// src/features/dashboard/pages/CourseReportPage.tsx

import type { CourseReportPageProps } from "../types/dashboard.types";
import { DashboardCard, DonutChartComponent } from "../components";
import {
  COURSE_REPORT_SUMMARY,
  COURSE_REPORT_STRENGTHS,
  COURSE_REPORT_WEAKNESSES,
  COURSE_REPORT_SCORE_DISTRIBUTION,
  COURSE_REPORT_ERROR_ANALYSIS,
  CHAPTER_NAMES
} from "../data/mockData";
import { StatCard } from "../components/StatCard";
import { useNavigate } from "react-router-dom";
import { useState } from "react";


export function CourseReportPage({ attemptId }: CourseReportPageProps) {
 // const displayAttemptId = attemptId || "ล่าสุด";
  const chapterName =
    (attemptId && CHAPTER_NAMES[attemptId]) || "Differential";

  const navigate = useNavigate();

  const [chapter] = useState(attemptId || "differential");
  const [mode, setMode] = useState("attempt1");

  const handleNavigate = (nextChapter = chapter, nextMode = mode) => {
    if (nextMode === "all") {
      navigate(`/dashboard/chapter/${nextChapter}/all`);
    } else if (nextMode === "attempt1") {
      navigate(`/dashboard/chapter/${nextChapter}`);
    }
  };
  return (
    <div className="min-h-screen bg-blue-50 px-4 py-4 ">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-extrabold text-[#003B62]">
            {chapterName.toUpperCase()} DASHBOARD
        </h1>
        <select
          className="border rounded-full px-4 py-1 text-sm bg-white"
          value={mode}
          onChange={(e) => {
            const value = e.target.value;
            setMode(value);
            handleNavigate(chapter, value);
          }}
        >
          <option value="all">ภาพรวม</option>
          <option value="attempt1">ครั้งที่ 1</option>
        </select>
        </div>

    <div className="grid grid-cols-2 mb-4">
      <div>
        <DashboardCard>
          <DonutChartComponent
            data={COURSE_REPORT_SCORE_DISTRIBUTION}
            centerLabel="87%"
            height={280}
          />
        </DashboardCard>
      </div>
      <div className="grid grid-row-3 ml-4 ">
        <div className="grid grid-cols-2 gap-2 mb-2 bg-white shadow-md p-4 rounded-2xl">
          <StatCard label="เวลาเฉลี่ยต่อข้อ" value={COURSE_REPORT_SUMMARY.avgTimePerQuestion} />
          <StatCard label="ระดับความเชี่ยวชาญภาพรวม" value={COURSE_REPORT_SUMMARY.proficiencyLevel} />
        </div>

        <div className="bg-white shadow-md p-4 rounded-2xl mb-2">
          <div>
            <h4 className="font-semibold mb-1">STRENGTHS</h4>
            <div className="flex gap-2 flex-wrap mb-2">
              {COURSE_REPORT_STRENGTHS.map((strength, idx) => (
                <span
                  key={`${strength}-${idx}`}
                  className="px-2 py-1 bg-yellow-100 text-gray-600 rounded-full text-xs font-tiny"
                >
                  {strength}
                </span>
              ))}
            </div>
            <div>
              <h4 className="font-semibold mb-1">WEAKNESSES</h4>
              <div className="flex gap-2 flex-wrap mb-2">
                {COURSE_REPORT_WEAKNESSES.map((weakness, idx) => (
                  <span
                    key={`${weakness}-${idx}`}
                    className="px-2 py-1 bg-blue-100 text-gray-600 rounded-full text-xs font-tiny"
                  >
                    {weakness}
                  </span>
                ))}   
               </div> 
            </div>
          </div>
        </div>
        <div className="bg-white shadow-md p-4 rounded-2xl">
          กราฟ
        </div>

      </div>

    </div>

     

    

      {/* table detail */}
      <DashboardCard title="การวิเคราะห์ข้อผิดพลาด (Error Analysis)">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="py-2 px-3 text-left">ลำดับ</th>
              <th className="py-2 px-3 text-left">หัวข้อ</th>
              <th className="py-2 px-3 text-left">จำนวนข้อผิด</th>
              <th className="py-2 px-3 text-left">อัตราข้อผิด</th>
              <th className="py-2 px-3 text-left">ข้อเสนอแนะ</th>
            </tr>
          </thead>
          <tbody>
            {COURSE_REPORT_ERROR_ANALYSIS.map((error, idx) => (
              <tr key={error.id} className={idx === COURSE_REPORT_ERROR_ANALYSIS.length - 1 ? "" : "border-b"}>
                <td className="py-3 px-3">{error.id}</td>
                <td className="py-3 px-3 font-medium">{error.topic}</td>
                <td className="py-3 px-3">{error.errors} ข้อ</td>
                <td className="py-3 px-3">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                    {error.errorRate}
                  </span>
                </td>
                <td className="py-3 px-3 text-gray-700">{error.suggestion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DashboardCard>
    </div>
  );
}
