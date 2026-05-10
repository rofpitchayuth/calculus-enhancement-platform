import { useNavigate } from "react-router-dom";
import { ProgressCard } from "../components/ProgressCard";
import { CourseSection } from "../components/CourseSection";
import { useDashboardOverview, useTopicsSummary } from "../../dashboard/hooks/useDashboard";
import { DashboardCard } from "../../dashboard/components";
import char1 from '../../dashboard/components/character/LuckyGuessers.png'
import char2 from '../../dashboard/components/character/Careless.png'
import char3 from '../../dashboard/components/character/HighAchiever.png'
import char4 from '../../dashboard/components/character/Developing.png'
import char5 from '../../dashboard/components/character/Struggling.png'

/**
 * ImageMap
 * Maps English backend status keys to local image assets.
 */
const ImageMap: Record<string, string> = {
  "Lucky Guesser": char1,
  "Careless (High Slip)": char2,
  "High Achiever": char3,
  "Developing (Average)": char4,
  "Struggling": char5,
};

/**
 * StatusThaiMap
 * Maps English backend status enums to Thai display strings.
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

const COURSE_METADATA: Record<string, { description: string;}> = {
  LIMIT: {
    description: "เรียนรู้แนวคิดลิมิตและความต่อเนื่องของฟังก์ชัน ซึ่งเป็นรากฐานสำคัญของแคลคูลัส",
  },
  DIFFERENTIAL: {
    description: "เรียนรู้การหาอนุพันธ์เพื่อวัดอัตราการเปลี่ยนแปลง เช่น ความเร็ว ความชัน หรือการเติบโตของฟังก์ชัน",
  },
  INTEGRAL: {
    description: "เรียนรู้การอินทิเกรตเพื่อหาพื้นที่ใต้กราฟ ปริมาตร และการสะสมของปริมาณต่างๆ",
  },
  APPLICATIONS: {
    description: "ประยุกต์ใช้แคลคูลัสในการแก้โจทย์ปัญหาจริง เช่น การหาค่าสูงสุด-ต่ำสุด และอัตราการเปลี่ยนแปลง",
  },
};

export function HomePage() {
  const navigate = useNavigate();
  const { overviewStats, chapterList, radarData, loading: overviewLoading } = useDashboardOverview();
  const { topics, isLoading: topicsLoading } = useTopicsSummary();

  const isLoading = overviewLoading || topicsLoading;

  const sortedChapters = [...chapterList].sort((a, b) => b.score - a.score);
  const avgScore = chapterList.length > 0
    ? Math.round(chapterList.reduce((sum, c) => sum + c.score, 0) / chapterList.length)
    : 0;

  const courses = topics.map((t) => {
    const meta = COURSE_METADATA[t.topicId] || {
      description: "",
    };
    return {
      id: t.topicId,
      title: t.displayName,
      description: meta.description,
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
    <div className="homepage bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8 bg-blue-50">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
          <div className="lg:col-span-2">
            <ProgressCard
              percentage={avgScore}
              level={overviewStats?.studentProfile ?? "Beginner"}
              radarData={radarData}
              onViewOverall={() => navigate("/dashboard")}
              onViewDetailed={() => navigate("/alldashboard")}
            />
          </div>
          <div>
            {overviewStats && (
              <DashboardCard title={`Your Level : ${getThaiStatus(overviewStats.studentProfile)}`}>
                <div className="flex justify-center items-center h-full">
                  <img
                    src={ImageMap[overviewStats.studentProfile]}
                    alt={overviewStats.studentProfile}
                    className="w-full max-h-[200px] object-contain"
                  />
                </div>
              </DashboardCard>
            )}
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