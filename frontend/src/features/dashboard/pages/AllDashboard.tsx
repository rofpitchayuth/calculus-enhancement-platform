// src/features/dashboard/pages/DashboardOverviewPage.tsx

import { ChapterCard } from "../components";
import {
  MOCK_CHAPTERS,
  DASHBOARD_OVERVIEW_STATS,
} from "../data/mockData";

export function AllDashboard() {
  return (
    <div className="min-h-screen bg-blue-50 px-4 py-4">
      <h1 className="text-4xl font-extrabold text-[#003B62] mb-6">
        DASHBOARD
      </h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {MOCK_CHAPTERS.map((chapter) => (
          <ChapterCard
            key={chapter.id}
            chapter={chapter}
            stats={DASHBOARD_OVERVIEW_STATS}
          />
        ))}
      </div>
    </div>
  );
}
