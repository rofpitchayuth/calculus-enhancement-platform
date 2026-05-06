// src/features/dashboard/pages/AllDashboard.tsx

import { ChapterCard } from '../components';
// import { useTopicsSummary } from '../hooks/useDashboard';
import { useTopicsSummary } from '../hooks/useDashboard';

interface AllDashboardProps {
  userId?: number;
}

export function AllDashboard({ userId = 1 }: AllDashboardProps) {
  const { 
    topics, 
    isLoading,
    error 
  } = useTopicsSummary();

  const statsForCard = {
    proficiencyLevel: '',
    averageScore:     0,
    totalAttempts:    0,
    totalChapters:    4,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#003B62]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <p className="text-red-500 font-semibold mb-2">Error Loading Dashboard</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-4">
      <h1 className="text-4xl font-extrabold text-[#003B62] mb-6">DASHBOARD</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((topic) => (
          <ChapterCard key={topic.topicId} chapter={topic} stats={statsForCard} />
        ))}
      </div>
    </div>
  );
}
