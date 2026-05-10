import { useNavigate } from "react-router-dom";
import { Navbar } from "../../../shared/components/layout/Navbar";
import { CourseSection } from "../components/CourseSection";
import { useTopicsSummary } from "../../dashboard/hooks/useDashboard";
import { useAuth } from "../../../features/auth/hooks/useAuth.tsx";
import logo from "../components/logo.png";


const COURSE_METADATA: Record<string, { description: string; }> = {
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
export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { topics } = useTopicsSummary();

  // Define default topics to display when user is not authenticated or data is loading
  const defaultTopics = [
    { topicId: "LIMIT", displayName: "LIMIT" },
    { topicId: "DIFFERENTIAL", displayName: "DIFFERENTIAL" },
    { topicId: "INTEGRAL", displayName: "INTEGRAL" },
    { topicId: "APPLICATIONS", displayName: "APPLICATIONS" },
  ];

  const topicsToDisplay = (topics && topics.length > 0) ? topics : defaultTopics;

  const courses = topicsToDisplay.map((t) => {
    const meta = COURSE_METADATA[t.topicId] || {
      description: "",
    };
    return {
      id: t.topicId,
      title: t.displayName,
      description: meta.description,
      questionCount: 0,
      duration: 0,
    };
  });


  return (
    <>

      <style>{`
        .calcurise-page {
          background: #eff6ff ;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        
        /* ── Hero Card ── */
        .cr-hero {
          background: #fff;
          border-radius: 28px;
          padding: 2.5rem 2rem;
          text-align: center;
          width: 100%;
          max-width: 520px;
          box-shadow: 0 4px 24px rgba(59, 130, 246, 0.09);
        }
        .cr-hero h1 {
          font-size: clamp(1.8rem, 5vw, 2.4rem);
          font-weight: 900;
          color: #1e3a5f;
          line-height: 1.2;
          margin-bottom: 0.85rem;
        }
        .cr-hero h1 span {
          color: #3b82f6;
        }
        .cr-hero p {
          font-size: 1rem;
          color: #64748b;
          line-height: 1.65;
          font-weight: 600;
          margin-bottom: 1.75rem;
        }

       
        
      `}</style>

      <div className="calcurise-page ">
        {/* Logo */}
        <Navbar />

        {/* Hero */}
        <div className="cr-hero flex flex-col items-center mt-10">
          <div className="cr-logo mb-4">
            <img src={logo} alt="CalcuRise Logo" style={{ maxWidth: '350px', height: 'auto' }} />
          </div>

          <p>
            Practice smarter with adaptive problems,<br />
            instant analysis, and visual progress tracking.
          </p>

        </div>
        <div className="max-w-5xl mx-auto px-4 py-8 bg-blue-50">
          <CourseSection
            courses={courses}
            onViewAll={() => navigate(isAuthenticated ? "/allquiz" : "/auth/login")}
            onStartCourse={(courseId) => navigate(isAuthenticated ? `/quiz/${courseId}` : "/auth/login")}
          />
        </div>
      </div>

    </>
  );
}
