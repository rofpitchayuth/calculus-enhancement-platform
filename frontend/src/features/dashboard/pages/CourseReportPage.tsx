// src/features/dashboard/pages/CourseReportPage.tsx

import type { CourseReportPageProps } from "../types/dashboard.type";
import { ReportCard, DashboardCard, DonutChartComponent } from "../components";
import {
  COURSE_REPORT_SUMMARY,
  COURSE_REPORT_STRENGTHS,
  COURSE_REPORT_WEAKNESSES,
  COURSE_REPORT_SCORE_DISTRIBUTION,
  COURSE_REPORT_ERROR_ANALYSIS,
} from "../data/mockData";

export function CourseReportPage({ attemptId }: CourseReportPageProps) {
  const displayAttemptId = attemptId || "ล่าสุด";

  return (
    <div className="min-h-screen bg-[#E8F4FF] px-10 py-8">
      <h1 className="text-3xl font-extrabold text-[#003B62] mb-2">
        COURSE REPORT
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        รายงานผลการทำแบบทดสอบครั้งที่: {displayAttemptId}
      </p>

      {/* summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <ReportCard label="คะแนนรวม" value={COURSE_REPORT_SUMMARY.totalScore} />
        <ReportCard label="เวลาเฉลี่ยต่อข้อ" value={COURSE_REPORT_SUMMARY.avgTimePerQuestion} />
        <ReportCard label="ระดับความเชี่ยวชาญภาพรวม" value={COURSE_REPORT_SUMMARY.proficiencyLevel} />
      </div>

      {/* charts */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <DashboardCard>
          <DonutChartComponent
            data={COURSE_REPORT_SCORE_DISTRIBUTION}
            centerLabel="87%"
            height={280}
          />
        </DashboardCard>

        <DashboardCard title="สรุปผลการสอบ">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">ระดับความเชี่ยวชาญ</h4>
              <p className="text-lg font-bold text-[#003B62]">ปานกลาง</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">ข้อสังเกต</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>คะแนนรวม 87% (ผ่านเกณฑ์)</li>
                <li>พยายามทำแบบทดสอบ 3 ครั้ง</li>
                <li>พัฒนาการดีขึ้น 8 คะแนน</li>
              </ul>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* strengths & weaknesses */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <DashboardCard title="จุดเด่น">
          <ul className="list-disc list-inside text-sm space-y-1">
            {COURSE_REPORT_STRENGTHS.map((strength, idx) => (
              <li key={idx}>{strength}</li>
            ))}
          </ul>
        </DashboardCard>

        <DashboardCard title="จุดที่ควรพัฒนา">
          <ul className="list-disc list-inside text-sm space-y-1">
            {COURSE_REPORT_WEAKNESSES.map((weakness, idx) => (
              <li key={idx}>{weakness}</li>
            ))}
          </ul>
        </DashboardCard>
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
