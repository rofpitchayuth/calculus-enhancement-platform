// src/features/dashboard/pages/DashboardLayoutPage.tsx

import { useState } from 'react';
import { ChapterDashboardPage } from './ChapterDashboardPage';
import { CourseReportPage } from './CourseReportPage';

interface DashboardLayoutPageProps {
  chapterId?: string;
  userId?: number;
  sessionId?: number;
}

export function DashboardLayoutPage({
  chapterId = 'limits',
  userId = 1,
  sessionId = 1,
}: DashboardLayoutPageProps) {
  const [mode, setMode] = useState('all');

  const isOverviewMode = mode === 'all';

  return (
    <>
      {/* Conditionally render pages with mode state */}
      {isOverviewMode ? (
        <ChapterDashboardPage 
          userId={userId}
          mode={mode}
          setMode={setMode}
        />
      ) : (
        <CourseReportPage 
          sessionId={sessionId} 
          userId={userId}
          mode={mode}
          setMode={setMode}
        />
      )}
    </>
  );
}
