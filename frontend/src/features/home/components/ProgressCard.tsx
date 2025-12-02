import { Card } from "../../../shared/components/ui/Card";
import { Button } from "../../../shared/components/ui/Button";

interface ProgressCardProps {
  percentage: number;
  level: string;
  masterTopics: string[];
  improvementTopics: string[];
  onViewOverall?: () => void;
  onViewDetailed?: () => void;
}

export function ProgressCard({
  percentage,
  level,
  masterTopics,
  improvementTopics,
  onViewOverall,
  onViewDetailed,
}: ProgressCardProps) {
  return (
    <Card className="p-8 shadow-lg h-full">
      <div className="grid grid-cols-2 gap-8">
        {/* Skill Diagram */}
        <div className="flex items-center justify-center">
          <div className="w-40 h-40 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-500">Graph</span>
          </div>
        </div>

        {/* Progress Info */}
        <div className="flex flex-col justify-center">
          <h3 className="text-sm text-gray-500 mb-2">คะแนนเฉลี่ยรวม</h3>
          <p className="text-4xl font-bold text-blue-600 mb-4">{percentage}%</p>
          <p className="text-lg font-semibold text-gray-700 mb-6">
            ระดับรวม {level}
          </p>

          <div className="space-y-3 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                บทที่ได้:
              </p>
              <div className="flex gap-2 flex-wrap">
                {masterTopics.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                บทที่ควรปรับปรุง:
              </p>
              <div className="flex gap-2 flex-wrap">
                {improvementTopics.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              className="flex-1 bg-blue-700 hover:bg-blue-800 text-sm"
              onClick={onViewOverall}
            >
              ดูภาพรวม
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-sm"
              onClick={onViewDetailed}
            >
              ดูแยกบท
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}