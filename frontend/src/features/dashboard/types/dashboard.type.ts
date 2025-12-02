// src/features/dashboard/types/dashboard.type.ts

/**
 * Props สำหรับ StatCard / ReportCard / OverviewStatCard
 */
export type StatCardProps = {
  label: string;
  value: string;
  sub?: string;
  subClass?: string;
};

/**
 * Props สำหรับ DashboardCard / ReportContainer
 */
export type DashboardCardProps = {
  title?: string;
  children: React.ReactNode;
};

/**
 * Props สำหรับ BloomBar
 */
export type BloomBarProps = {
  label: string;
  percent: number;
};

/**
 * Props สำหรับ ChapterCard
 */
export type ChapterSummary = {
  id: string;
  title: string;
  latestScore: number;
  attempts: number;
  trend: "up" | "down" | "steady";
};

/**
 * Props สำหรับ CourseReportPage
 */
export type CourseReportPageProps = {
  attemptId?: string;
};

/**
 * Props สำหรับ ChapterDashboardPage
 */
export type ChapterDashboardPageProps = {
  chapterId?: string;
};
