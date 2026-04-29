// src/features/dashboard/pages/AllDashboard.tsx

import { useState, useEffect } from 'react';
import { ChapterCard } from '../components';
import { fetchTopicsSummary } from '../api/dashboard.api';
import type { TopicSummary } from '../api/dashboard.api';
import type { ChapterSummary } from '../types/dashboard.types';

interface AllDashboardProps {
  userId?: number;
}

export function AllDashboard({ userId = 1 }: AllDashboardProps) {
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await fetchTopicsSummary();

        // แปลง TopicSummary → ChapterSummary ที่ ChapterCard ต้องการ
        const chapterCards: ChapterSummary[] = data.map((topic: TopicSummary) => ({
          id:               topic.topicId,
          title:            topic.displayName,
          latestScore:      topic.latestScore,   // คะแนนครั้งล่าสุดของ topic นี้
          trend:            'up' as const,
          attempts:         topic.totalAttempts,
          avgScore:         topic.latestScore,
          proficiencyLevel: topic.proficiencyLevel,
        }));

        setChapters(chapterCards);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const statsForCard = {
    proficiencyLevel: '',
    averageScore:     0,
    totalAttempts:    0,
    totalChapters:    4,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#003B62]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-4">
      <h1 className="text-4xl font-extrabold text-[#003B62] mb-6">DASHBOARD</h1>
      <div className="grid grid-cols-3 gap-4">
        {chapters.map((chapter) => (
          <ChapterCard key={chapter.id} chapter={chapter} stats={statsForCard} />
        ))}
      </div>
    </div>
  );
}
