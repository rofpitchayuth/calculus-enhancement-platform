import { Card } from "../../../shared/components/ui/Card";
import { Button } from "../../../shared/components/ui/Button";
import { RadarChartComponent } from "../../dashboard/components";
import { DASHBOARD_OVERALL_SKILLS_RADAR } from "../../dashboard/data/mockData";

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
    <Card className="shadow-lg h-full pr-8">
      <div className="grid grid-cols-2 gap-8">
        {/* Skill Diagram */}
        <div className="flex items-center justify-center">
           <RadarChartComponent
                   data={DASHBOARD_OVERALL_SKILLS_RADAR}
                   dataKey="limit"
                   angleKey="skill"
                   fill="#3b82f6"
                   height={230}
                 />
        </div>

        {/* Progress Info */}
        <div className="flex flex-col justify-center">
        <p className="text-lg text-gray-700 mb-2">
          คะแนนเฉลี่ยรวม{" "}
          <span className="font-bold text-gray-900">
            {percentage}%
          </span>{" "}
          ระดับรวม{" "}
          <span className="font-bold text-gray-900">
            {level}
          </span>
        </p>

          <div className="space-y-3 mb-4">
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
              variant="home1"
              size="md"
              className="flex-1 bg-blue-700 hover:bg-blue-900 text-md rounded-full "
              onClick={onViewOverall}
            >
              ดูภาพรวม
            </Button>
            <Button
              variant="home2"
              size="md"
              className="flex-1 text-md rounded-full bg-gray-200"
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