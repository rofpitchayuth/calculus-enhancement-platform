import { Card } from "../../../shared/components/ui/Card";
import { Button } from "../../../shared/components/ui/Button";

interface CourseCardProps {
  id?: string | number;
  title: string;
  description: string;
  questionCount: number;
  duration: number;
  thumbnail?: string;
  onStart?: () => void;
}

export function CourseCard({
  id,
  title,
  description,
  questionCount,
  duration,
  thumbnail,
  onStart,
}: CourseCardProps) {
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
          onClick={onStart}
        >
          เริ่มทำแบบทดสอบ
        </Button>
    </Card>
  );
}