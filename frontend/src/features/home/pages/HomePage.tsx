// src/features/home/pages/HomePage.tsx
// Home page that displays real user progress from the dashboard API
// and the standardized topic list from TOPIC_CONFIG.

import { useNavigate } from "react-router-dom";
import { ProgressCard } from "../components/ProgressCard";
import { CourseSection } from "../components/CourseSection";
import { useDashboardOverview, useTopicsSummary } from "../../dashboard/hooks/useDashboard";

// Standardized course metadata — topic IDs match the backend's MainTopic enum.
// Description and duration are static metadata, not mock data.
const COURSE_METADATA: Record<string, { description: string; numQuestions: number; duration: number }> = {
  LIMIT: {
    description: "เรียนรู้แนวคิดลิมิตและความต่อเนื่องของฟังก์ชัน ซึ่งเป็นรากฐานสำคัญของแคลคูลัส",
    numQuestions: 10,
    duration: 60,
  },
  DIFFERENTIAL: {
    description: "เรียนรู้การหาอนุพันธ์เพื่อวัดอัตราการเปลี่ยนแปลง เช่น ความเร็ว ความชัน หรือการเติบโตของฟังก์ชัน",
    numQuestions: 10,
    duration: 60,
  },
  INTEGRAL: {
    description: "เรียนรู้การอินทิเกรตเพื่อหาพื้นที่ใต้กราฟ ปริมาตร และการสะสมของปริมาณต่างๆ",
    numQuestions: 10,
    duration: 60,
  },
  APPLICATIONS: {
    description: "ประยุกต์ใช้แคลคูลัสในการแก้โจทย์ปัญหาจริง เช่น การหาค่าสูงสุด-ต่ำสุด และอัตราการเปลี่ยนแปลง",
    numQuestions: 10,
    duration: 60,
  },
};

export function HomePage() {
  const navigate = useNavigate();
  const { overviewStats, chapterList, radarData, loading: overviewLoading } = useDashboardOverview();
  const { topics, isLoading: topicsLoading } = useTopicsSummary();

  const isLoading = overviewLoading || topicsLoading;

  // Derive strengths / weaknesses from real chapter progress data
  const sortedChapters = [...chapterList].sort((a, b) => b.score - a.score);
  const masterTopics = sortedChapters.filter((c) => c.score >= 60).map((c) => c.chapter);
  const improvementTopics = sortedChapters.filter((c) => c.score < 60).map((c) => c.chapter);

  // Average score across all chapters (from overview or computed from progress)
  const avgScore = chapterList.length > 0
    ? Math.round(chapterList.reduce((sum, c) => sum + c.score, 0) / chapterList.length)
    : 0;

  // Build course cards from real topics summary + static metadata
  const courses = topics.map((t) => {
    const meta = COURSE_METADATA[t.topicId] || {
      description: "",
      numQuestions: 10,
      duration: 60,
    };
    return {
      id: t.topicId,
      title: t.displayName,
      description: meta.description,
      questionCount: meta.numQuestions,
      duration: meta.duration,
    };
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#003B62]" />
      </div>
    );
  }

  return (
    <div className="homepage bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pb-12 bg-blue-50">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
          {/* Progress Section — bound to real API data */}
          <div className="lg:col-span-2">
            <ProgressCard
              percentage={avgScore}
              level={overviewStats?.studentProfile ?? "Beginner"}
              masterTopics={masterTopics.length > 0 ? masterTopics : ["—"]}
              improvementTopics={improvementTopics.length > 0 ? improvementTopics : ["—"]}
              radarData={radarData}
              onViewOverall={() => navigate("/dashboard")}
              onViewDetailed={() => navigate("/dashboard")}
            />
          </div>
        </div>

        {/* Courses Section — built from real topics summary */}
        <CourseSection
          courses={courses}
          onViewAll={() => navigate("/allquiz")}
          onStartCourse={(courseId) => navigate(`/quiz/${courseId}`)}
        />
      </div>
    </div>
  );
}