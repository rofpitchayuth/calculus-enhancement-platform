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
  onClick?: () => void;
}

export function CourseCard({
  //id,
  title,
  description,
  questionCount,
  duration,
  // thumbnail,
  onClick,
}: CourseCardProps) {
  const navigate = useNavigate();

  const handleStart = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/quiz`);
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
      <h3 className="text-3xl font-bold text-gray-800 mb-1">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {description}
      </p>

      {/* Course Info */}
      <div className="space-y-2 mb-3 text-sm text-gray-600">
        <div className="flex justify-between ">
          <span>
            <div className="border rounded-full p-1 px-2 border-blue-200 mr-1 w-max">จำนวนข้อ {questionCount} ข้อ </div>
          </span>
          <span>
            <div className="border rounded-full p-1 px-2 border-blue-200 w-max">
              เวลาในการทำข้อสอบ {duration} นาที
            </div>
          </span>
        </div>
      </div>

      <Button
        variant="primary"
        size="sm"
        className="w-full bg-blue-900 hover:bg-blue-950 text-white rounded-full font-semibold"
        onClick={handleStart}
      >
        เริ่มทำแบบทดสอบ
      </Button>
    </Card>
  );
}