import { Card } from "../../../shared/components/ui/Card";
import { Button } from "../../../shared/components/ui/Button";
import { useNavigate } from "react-router-dom";

interface CourseCardProps {
  id?: string | number;
  title: string;
  description: string;
  questionCount: number;
  duration: number;
  thumbnail?: string;
}

export function CourseCard({
  id,
  title,
  description,
  questionCount,
  duration,
  thumbnail,
}: CourseCardProps) {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate(`/quiz`);
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
      {/* Image */}
      <div className="h-40 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-400 mb-2"></div>
            <p className="text-slate-500 text-sm">Image</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {description}
        </p>

        {/* Course Info */}
        <div className="space-y-2 mb-6 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>จำนวนข้อ:</span>
            <span className="font-medium">{questionCount} ข้อ</span>
          </div>
          <div className="flex justify-between">
            <span>เวลาในการทำข้อสอบ:</span>
            <span className="font-medium">{duration} นาที</span>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full bg-blue-900 hover:bg-blue-950 text-white rounded-lg font-semibold"
          onClick={handleStart}
        >
          เริ่มทำแบบทดสอบ
        </Button>
      </div>
    </Card>
  );
}