import { Button } from "../../../shared/components/ui/Button";
import { CourseCard } from "./CourseCard";

interface Course {
  id: string | number;
  title: string;
  description: string;
  questionCount: number;
  duration: number;
  thumbnail?: string;
}

interface CourseSectionProps {
  courses: Course[];
  onViewAll?: () => void;
  onStartCourse?: (courseId: string | number) => void;
}

export function CourseSection({
  courses,
  onViewAll,
  onStartCourse,
}: CourseSectionProps) {
  return (
    <section className="courses">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800">COURSE</h2>
        <Button
          variant="primary"
          size="md"
          className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-6"
          onClick={onViewAll}
        >
          ดูแบบทดสอบทั้งหมด
        </Button>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.title}
            description={course.description}
            questionCount={course.questionCount}
            duration={course.duration}
            thumbnail={course.thumbnail}
            onStart={() => onStartCourse?.(course.id)}
          />
        ))}
      </div>
    </section>
  );
}