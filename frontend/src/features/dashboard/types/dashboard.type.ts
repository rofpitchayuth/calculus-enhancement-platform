// src/features/dashboard/types/dashboard.type.ts

/**
 * Dashboard Types & Interfaces
 */

// ===== Quiz & Question Types =====
export interface Question {
  id: number;
  question_text: string;
  correct_answer: string;
  choices: string[] | null;
  difficulty: number;
  discrimination: number;
  guessing: number;
  bloom_level: string;
  main_topic: string;
  sub_topic: string;
  skill_tags: string[];
  created_at: string;
  updated_at: string;
}

export interface QuizResult {
  id: number;
  user_id: number;
  quiz_attempt_id: number;
  session_id: number;
  question_id: number;
  is_correct: boolean;
  difficulty: string;
  response_time: number;
  skill_tag: string;
  user_answer: string;
  error_code: string | null;
}

export interface QuizSession {
  id: number;
  user_id: number;
  title: string;
  session_type: 'practice' | 'exam';
  start_time: string;
  end_time: string;
  total_score: number;
  total_questions: number;
  created_at: string;
  updated_at: string;
}

// ===== Chapter Types =====
export interface Chapter {
  id: string;
  name: string;
  title: string;
  topic: string;
  description?: string;
}

export interface ChapterProgress {
  chapter: string;
  score: number;
  attempts: number;
  lastAttemptDate: string;
  avgTime: number;
  correctCount: number;
  incorrectCount: number;
}

export interface ChapterSummary {
  id: string;
  title: string;
  latestScore: number;
  trend: 'up' | 'down' | 'neutral';
  attempts: number;
  avgScore: number;
  proficiencyLevel: string;
}

// ===== Dashboard Stats Types =====
export interface OverviewStats {
  totalChapters: number;
  averageScore: number;
  totalAttempts: number;
  proficiencyLevel: string;
  avgTimePerQuestion: number;
}

export interface ChapterStats {
  chapterId: string;
  chapterName: string;
  averageScore: number;
  totalAttempts: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  avgTimePerQuestion: number;
  proficiencyLevel: string;
  strengths: string[]; // skill tags ที่ตอบถูกเยอะ
  weaknesses: string[]; // skill tags ที่ตอบผิดเยอะ
  bloomLevels: BloomLevelStats[];
  skillBreakdown: SkillBreakdown[];
}

export interface BloomLevelStats {
  label: string;
  percent: number;
  count: number;
}

export interface SkillBreakdown {
  skill: string;
  correct: number;
  incorrect: number;
  accuracy: number;
}

export interface CourseReportData {
  sessionId: number;
  chapterId: string;
  chapterName: string;
  totalScore: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  avgTimePerQuestion: number;
  strengths: string[];
  weaknesses: string[];
  errorAnalysis: ErrorAnalysisItem[];
  skillBreakdown: SkillBreakdown[];
}

export interface ErrorAnalysisItem {
  id: number;
  topic: string;
  errorCount: number;
  errorRate: string;
  suggestion: string;
  questions?: number[];
}

export interface AttemptRecord {
  attempt: number;
  date: string;
  score: number;
  avgTime: number;
  correctCount: number;
  totalQuestions: number;
}

// ===== Chart Data Types =====
export interface RadarChartData {
  skill: string;
  [key: string]: string | number;
}

export interface LineChartData {
  attempt?: number;
  date?: string;
  score?: number;
  avgTime?: number;
  [key: string]: any;
}

export interface DonutChartData {
  name: string;
  value: number;
  color: string;
}

// ===== Component Props =====
export interface DashboardCardProps {
  title?: string;
  children: React.ReactNode;
}

export interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  subClass?: string;
}

export interface BloomBarProps {
  label: string;
  percent: number;
}

export interface ChapterCardProps {
  chapter: ChapterSummary;
  stats: OverviewStats;
}

export interface LineChartComponentProps {
  data: LineChartData[];
  dataKey: string;
  title?: string;
  xAxisKey?: string;
  stroke?: string;
  height?: number;
}

export interface RadarChartComponentProps {
  data: RadarChartData[];
  dataKey: string;
  angleKey?: string;
  title?: string;
  fill?: string;
  height?: number;
}

export interface DonutChartComponentProps {
  data: DonutChartData[];
  title?: string;
  height?: number;
  centerLabel?: string;
}

export interface ProgressBarComponentProps {
  label: string;
  current: number;
  total: number;
  color?: string;
}

// ===== Page Props =====
export interface DashboardOverviewPageProps {}

export interface AllDashboardProps {
  userId?: number;
}

export interface ChapterDashboardPageProps {
  chapterId?: string;
  userId?: number;
}

export interface CourseReportPageProps {
  attemptId?: number;
  sessionId?: number;
  userId?: number;
}

// ===== Filter & Sort Types =====
export interface DashboardFilters {
  userId?: number;
  chapterId?: string;
  sessionId?: number;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}