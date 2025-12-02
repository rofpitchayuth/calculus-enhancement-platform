import { useNavigate } from "react-router-dom";
import { ProgressCard } from "../components/ProgressCard";
import { Placeholder } from "../components/Placeholder";
import { CourseSection } from "../components/CourseSection";

interface Course {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  duration: number;
}

const mockCourses: Course[] = [
  {
    id: "1",
    title: "Differential",
    description:
      "แบบทดสอบบทอนุพันธ์เพื่อวัดความเข้าใจในแนวคิดพื้นฐานและการประยุกต์ใช้อนุพันธ์",
    questionCount: 20,
    duration: 60,
  },
  {
    id: "2",
    title: "Differential",
    description:
      "แบบทดสอบบทอนุพันธ์เพื่อวัดความเข้าใจในแนวคิดพื้นฐานและการประยุกต์ใช้อนุพันธ์",
    questionCount: 20,
    duration: 60,
  },
  {
    id: "3",
    title: "Differential",
    description:
      "แบบทดสอบบทอนุพันธ์เพื่อวัดความเข้าใจในแนวคิดพื้นฐานและการประยุกต์ใช้อนุพันธ์",
    questionCount: 20,
    duration: 60,
  },
];

export function HomePage() {
  const navigate = useNavigate();

  const handleViewOverall = () => {
    console.log("View Overall Progress");
  };

  const handleViewDetailed = () => {
    console.log("View Detailed Progress");
  };

  const handleViewAllCourses = () => {
    navigate("/courses");
  };

  const handleStartCourse = (courseId: string | number) => {
    navigate(`/course/${courseId}`);
  };

  return (
    <div className="homepage bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pb-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Progress Section */}
          <div className="lg:col-span-2">
            <ProgressCard
              percentage={75}
              level="ปานกลาง"
              masterTopics={["Limit", "Differential", "Integrate"]}
              improvementTopics={["Apply", "Graph"]}
              onViewOverall={handleViewOverall}
              onViewDetailed={handleViewDetailed}
            />
          </div>

          {/* New feature */}
          <Placeholder
            title="New feature"
            subtitle="(Coming Soon)"
          />
        </div>

        {/* Courses Section */}
        <CourseSection
          courses={mockCourses}
          onViewAll={handleViewAllCourses}
          onStartCourse={handleStartCourse}
        />
      </div>
    </div>
  );
}