// src/features/dashboard/pages/AllDashboard.tsx

import { useState, useEffect } from 'react';
import { ChapterCard } from '../components';
import { dashboardService } from '../services/dashboard.service';
import type { OverviewStats, ChapterSummary } from '../types/dashboard.types';

interface AllDashboardProps {
  userId?: number;
}

/**
 * AllDashboard - แสดงภาพรวมของทั้ง 6 บท
 *
 * โครงสร้าง:
 * - Grid 3 columns × 2 rows = 6 chapter cards
 * - แต่ละ card แสดง: ชื่อบท, คะแนนล่าสุด, trend, เวลาต่อข้อ, ความเชี่ยวชาญ, จำนวนครั้งที่ทำ
 *
 * Mock Data: ใช้จาก dashboardService.getChapterProgressList
 * API Integration: Replace getChapterProgressList ด้วย API call
 */

const CHAPTERS = [
  { id: 'limits', topic: 'Limits', name: 'Limits' },
  { id: 'continuity', topic: 'Continuity', name: 'Continuity' },
  { id: 'derivatives', topic: 'Derivatives', name: 'Derivatives' },
  { id: 'applications-derivatives', topic: 'Applications of Derivatives', name: 'Applications of Derivatives' },
  { id: 'integrals', topic: 'Integrals', name: 'Integrals' },
  { id: 'applications-integrals', topic: 'Applications of Integrals', name: 'Applications of Integrals' },
];


export function AllDashboard({ userId = 1 }: AllDashboardProps) {
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch unified dashboard data
        const data = await dashboardService.getUnifiedDashboardData(userId);
        setOverviewStats(data.overview);

        // Transform progress data to chapter cards
        const chapterCards: ChapterSummary[] = CHAPTERS.map((chapter) => {
          const progress = data.chapterProgress[chapter.id];
          
          // Calculate score based on completed/total ratio
          const score = progress ? Math.round((progress.completed / progress.total) * 100) : 0;

          return {
            id: chapter.id,
            title: chapter.name,
            latestScore: score,
            trend: Math.random() > 0.5 ? 'up' : 'down',
            attempts: 0, // Will be populated from unified data if available
            avgScore: score,
          };
        });

        setChapters(chapterCards);
      } catch (error) {
        console.error('Failed to fetch chapter data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading || !overviewStats) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#003B62]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 px-4 py-4">
      {/* Header */}
      <h1 className="text-4xl font-extrabold text-[#003B62] mb-6">
        DASHBOARD
      </h1>
      

      {/* Chapter Cards Grid */}
      <div className="grid grid-cols-3 gap-4">
        {chapters.map((chapter) => (
          <ChapterCard
            key={chapter.id}
            chapter={chapter}
            stats={overviewStats}
          />
        ))}
      </div>
      
    </div>
  );
}
