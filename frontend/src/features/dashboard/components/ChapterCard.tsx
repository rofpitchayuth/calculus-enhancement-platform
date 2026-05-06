// src/features/dashboard/components/ChapterCard.tsx
// Card component for each topic shown on the AllDashboard page.
// Props use TopicSummary from the backend contract.

import type { TopicSummary } from "../types/dashboard.types";

/**
 * Props for ChapterCard.
 * `chapter` is a TopicSummary from the backend.
 * `stats` provides shared overview-level numbers for display.
 */
interface ChapterCardProps {
  chapter: TopicSummary;
  stats: {
    proficiencyLevel: string;
    averageScore: number;
    totalAttempts: number;
    totalChapters: number;
  };
}

export function ChapterCard({ chapter, stats }: ChapterCardProps) {
  return (
    <a
      href={`/dashboard/chapter/${chapter.topicId}/all`}
      className="bg-white rounded-2xl shadow-md p-5 flex flex-col justify-between w-full block"
    >
      <div>
        <h3 className="text-3xl font-semibold text-[#003B62]">
          {chapter.displayName}
        </h3>
        <div className="flex flex-row mt-3">
          <div className="text-5xl text-blue-900 font-medium w-35 h-35 rounded-full bg-blue-100 border-yellow-100 border-2 flex items-center justify-center mr-4">
            {chapter.latestScore}%
          </div>
          <div>
            <p className="text-md text-gray-500 mt-2">
              คะแนนล่าสุด : <span className="text-gray-900 font-bold">{chapter.latestScore}%</span>
            </p>
            <p className="text-md text-gray-500 mt-2">
              ความเชี่ยวชาญ : <span className="text-gray-900 font-bold">{chapter.proficiencyLevel}</span>
            </p>
            <p className="text-md text-gray-500 mt-2">
              จำนวนครั้งที่ทำ : <span className="text-gray-900 font-bold">{chapter.totalAttempts}</span>
            </p>
          </div>
        </div>
      </div>
    </a>
  );
}
