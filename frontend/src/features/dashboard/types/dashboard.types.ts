// src/features/dashboard/types/dashboard.types.ts
// TypeScript interfaces that are a 1:1 mirror of the backend Pydantic schemas.
// No snake_case → camelCase transformation is applied by the Axios client,
// so field names MUST match the backend's JSON response exactly.

export type MainTopic = 'LIMIT' | 'DIFFERENTIAL' | 'INTEGRAL' | 'APPLICATIONS';

// ─── Overview ──────────────────────────────────────────────────────────

export interface DashboardOverviewStats {
  totalChapters: string;
  averageScore: string;
  totalAttempts: string;
  studentProfile: string;
  avgMastery: number;
}

// ─── Chapter Progress ──────────────────────────────────────────────────

export interface ChapterProgress {
  completed: number;
  total: number;
}

export interface DashboardChapterProgressResponse {
  data: Record<string, ChapterProgress>;
}

// ─── Skills Radar ──────────────────────────────────────────────────────

export interface RadarSkill {
  skill: string;
  limit: number;
  differential: number;
  integral: number;
  applications: number;
}

export interface DashboardSkillsRadarResponse {
  data: RadarSkill[];
}

// ─── Recent Attempts ───────────────────────────────────────────────────

export interface RecentAttempt {
  attempt: number;
  score: number;
  date: string;
  avgTime: number | null;
  strengths: string[];
  weaknesses: string[];
}

export interface DashboardRecentAttemptsResponse {
  data: RecentAttempt[];
}

// ─── Chapter Stats ─────────────────────────────────────────────────────

export interface BloomLevel {
  label: string;
  percent: number;
}

export interface ChapterStatsResponse {
  proficiencyLevel: string;
  totalAttempts: number;
  avgTimePerQuestion: number;
  bloomLevels: BloomLevel[];
  strengths: string[];
  weaknesses: string[];
}

// ─── Chapter Attempts ──────────────────────────────────────────────────

export interface ChapterAttemptRecord {
  attempt: number;
  date: string;
  score: number;
  avgTime: number;
}

export interface ChapterAttemptsResponse {
  data: ChapterAttemptRecord[];
}

// ─── Chapter Sessions ──────────────────────────────────────────────────

export interface ChapterSession {
  sessionId: number;
  attempt: number;
  date: string;
}

export interface ChapterSessionsResponse {
  data: ChapterSession[];
}

// ─── Session Report ────────────────────────────────────────────────────

export interface SkillBreakdown {
  skill: string;
  accuracy: number;
}

export interface ErrorAnalysisItem {
  id: number;
  topic: string;
  errorCount: number;
  errorRate: string;
  suggestion: string;
}

export interface ScoreDistributionItem {
  name: string;
  value: number;
}

export interface QuizQuestionItem {
  question_number: number;
  question_text: string;
  choices: { id: string; text: string }[];
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
}

export interface SessionReportResponse {
  chapterId: string;
  correctAnswers: number;
  totalQuestions: number;
  avgTimePerQuestion: number;
  avgDifficulty: number;
  strengths: string[];
  weaknesses: string[];
  skillBreakdown: SkillBreakdown[];
  errorAnalysis: ErrorAnalysisItem[];
  scoreDistribution: ScoreDistributionItem[];
  quizQuestions: QuizQuestionItem[];
}

// ─── Topics Summary ────────────────────────────────────────────────────

export interface TopicSummary {
  topicId: string;
  displayName: string;
  latestScore: number;
  totalAttempts: number;
  proficiencyLevel: string;
}

export interface TopicsSummaryResponse {
  data: TopicSummary[];
}

// ─── UI-only presentation types (not from backend) ─────────────────────

export interface ChapterProgressItem {
  chapter: string;
  score: number;
  total: number;
}

/**
 * Data point for the line chart on the overview page.
 * Derived from RecentAttempt in the hook, not from the backend directly.
 */
export interface LineChartData {
  name: string;
  score: number;
  avgTime: number;
}
