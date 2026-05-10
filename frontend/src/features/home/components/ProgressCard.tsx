// src/features/home/components/ProgressCard.tsx
// Progress summary card displayed on the home page.
// Radar chart data is received via props from the parent (real API data).

import { Card } from "../../../shared/components/ui/Card";
import { Button } from "../../../shared/components/ui/Button";
import { RadarChartComponent } from "../../dashboard/components";
import type { RadarSkill } from "../../dashboard/types/dashboard.types";

interface ProgressCardProps {
  percentage: number;
  level: string;
  radarData: RadarSkill[];
  onViewOverall?: () => void;
  onViewDetailed?: () => void;
}

/**
 * StatusThaiMap
 * Maps English backend status enums to Thai display strings for the UI.
 */
const StatusThaiMap: Record<string, string> = {
  "Lucky Guesser": "🎲 นักเดามือทอง",
  "High Achiever": "🏆 ยอดฝีมือแคลคูลัส",
  "Careless": "😅 นักสะดุดยอดหญ้า",
  "Careless (High Slip)": "😅 นักสะดุดยอดหญ้า",
  "Developing": "🚀 นักสู้ผู้กำลังพัฒนา",
  "Developing (Average)": "🚀 นักสู้ผู้กำลังพัฒนา",
  "Struggling": "💦 นักสู้(สู้ชีวิต)",
};

/**
 * getThaiStatus
 * Helper function to retrieve the Thai display string for a given status.
 */
const getThaiStatus = (status: string) => StatusThaiMap[status] || status;

/**
 * Transform backend RadarSkill[] (skill × topic matrix) into a per-topic
 * summary array that the single-axis RadarChart can render.
 *
 * Input shape:  [{skill:"Concept", limit:80, differential:70, integral:60, applications:50}, ...]
 * Output shape: [{skill:"LIMIT", score:75}, {skill:"DIFFERENTIAL", score:68}, ...]
 *
 * Each output point = average accuracy across all cognitive skills for that topic.
 */
function mapRadarDataForChart(
  radarData: RadarSkill[],
): { skill: string; score: number }[] {
  const topics = ["limit", "differential", "integral", "applications"] as const;
  const labels: Record<string, string> = {
    limit: "LIMIT",
    differential: "DIFFERENTIAL",
    integral: "INTEGRAL",
    applications: "APPLICATIONS",
  };

  return topics.map((topicKey) => {
    const total = radarData.reduce((sum, r) => sum + r[topicKey], 0);
    const avg = radarData.length > 0 ? Math.round(total / radarData.length) : 0;
    return { skill: labels[topicKey], score: avg };
  });
}

export function ProgressCard({
  percentage,
  level,
  radarData,
  onViewOverall,
  onViewDetailed,
}: ProgressCardProps) {
  // Transform the backend radar data to the shape the RadarChart expects
  const chartData = mapRadarDataForChart(radarData);

  // Deriving unified topic lists from the EXACT same data source as the Radar Chart
  // to ensure UI consistency across all progress visualization elements.
  const unifiedMasterTopics = chartData
    .filter((d) => d.score >= 60)
    .map((d) => d.skill);
  
  const unifiedImprovementTopics = chartData
    .filter((d) => d.score < 60)
    .map((d) => d.skill);

  return (
    <Card className="shadow-lg h-full pr-8">
      <div className="grid grid-cols-2 gap-8">
        {/* Skill Diagram */}
        <div className="flex items-center justify-center">
           <RadarChartComponent
                   data={chartData}
                   dataKey="score"
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
        </p>
        <p>
          ระดับรวม{" "}
          <span className="font-bold text-gray-900">
            {getThaiStatus(level)}
          </span>
        </p>
      
          <div className="space-y-3 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                บทที่ได้:
              </p>
              <div className="flex gap-2 flex-wrap">
                {unifiedMasterTopics.length > 0 ? (
                  unifiedMasterTopics.map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium"
                    >
                      {topic}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">—</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                บทที่ควรปรับปรุง:
              </p>
              <div className="flex gap-2 flex-wrap">
                {unifiedImprovementTopics.length > 0 ? (
                  unifiedImprovementTopics.map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                    >
                      {topic}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">—</span>
                )}
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