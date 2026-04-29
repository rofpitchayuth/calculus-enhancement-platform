// src/features/dashboard/api/dashboard.api.ts
//
// API Layer สำหรับ Dashboard ทั้งหมด
// แก้ VITE_API_URL ใน .env ของ Frontend:  VITE_API_URL=http://localhost:8000
import axios from 'axios';

const BASE = 'http://localhost:8000/api/v1/dashboard';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return { Authorization: `Bearer ${token}` };
};

async function get<T>(path: string): Promise<T> {
  const res = await axios.get<T>(`${BASE}${path}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
}
// ─── Response types (ตรงกับ Backend schemas) ─────────────────────────────

export interface OverviewStats {
  totalChapters: string;
  averageScore: string;
  totalAttempts: string;
  studentProfile: string;
  avgMastery: number;
}

export interface ChapterProgressRaw {
  data: Record<string, { completed: number; total: number }>;
}

export interface RadarSkill {
  skill: string;
  limit: number;
  differential: number;
  integral: number;
}

export interface RecentAttempt {
  attempt: number;
  score: number;
  date: string;
  avgTime: number | null;
  strengths: string[];   // ← เพิ่ม
  weaknesses: string[];  // ← เพิ่ม

}

export interface ChapterStats {
  proficiencyLevel: string;
  totalAttempts: number;
  avgTimePerQuestion: number;
  bloomLevels: { label: string; percent: number }[];
  strengths: string[];
  weaknesses: string[];
}

export interface ChapterAttemptRecord {
  attempt: number;
  date: string;
  score: number;
  avgTime: number;
}

export interface SessionReport {
  chapterId: string;
  correctAnswers: number;
  totalQuestions: number;
  avgTimePerQuestion: number;
  strengths: string[];
  weaknesses: string[];
  skillBreakdown: { skill: string; accuracy: number }[];
  errorAnalysis: {
    id: number;
    topic: string;
    errorCount: number;
    errorRate: string;
    suggestion: string;
  }[];
  scoreDistribution: { name: string; value: number }[];
  quizQuestions: {         // ← เพิ่ม
    question_number: number;
    question_text: string;
    choices: { id: string; text: string }[];
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
  }[];
}

// ─── Transformed types (ที่ Frontend ใช้จริง) ────────────────────────────

/** แปลง chapter-progress จาก DB format → Frontend format */
export interface ChapterProgressItem {
  chapter: string;   // display name
  score: number;     // 0-100
  avgTime: number;   // placeholder (ยังไม่มีใน endpoint นี้)
  attempts: number;
}

const TOPIC_DISPLAY: Record<string, string> = {
  limit:        'Limits',
  differential: 'Derivatives',
  integral:     'Integrals',
};

export function transformChapterProgress(raw: ChapterProgressRaw): ChapterProgressItem[] {
  return Object.entries(raw.data).map(([topic, prog]) => ({
    chapter:  TOPIC_DISPLAY[topic] ?? topic,
    score:    prog.completed,
    avgTime:  0,
    attempts: 0,
  }));
}
export interface ChapterSession {
  sessionId: number;
  attempt: number;
  date: string;
}

export interface TopicSummary {
  topicId: string;
  displayName: string;
  latestScore: number;
  totalAttempts: number;
  proficiencyLevel: string;
}



// ─── API functions ────────────────────────────────────────────────────────

/** DashboardOverviewPage, AllDashboard */
export const fetchOverviewStats = () =>
  get<OverviewStats>('/overview');

/** DashboardOverviewPage, AllDashboard */
export const fetchChapterProgress = () =>
  get<ChapterProgressRaw>('/chapter-progress');

/** DashboardOverviewPage, ChapterDashboardPage */
export const fetchSkillsRadar = () =>
  get<{ data: RadarSkill[] }>('/skills-radar');

/** DashboardOverviewPage */
export const fetchRecentAttempts = () =>
  get<{ data: RecentAttempt[] }>('/recent-attempts');

/** ChapterDashboardPage */
export const fetchChapterStats = (chapterId: string) =>
  get<ChapterStats>(`/chapter/${chapterId}/stats`);

/** ChapterDashboardPage */
export const fetchChapterAttempts = (chapterId: string) =>
  get<{ data: ChapterAttemptRecord[] }>(`/chapter/${chapterId}/attempts`);

/** CourseReportPage */
export const fetchSessionReport = (sessionId: number) =>
  get<SessionReport>(`/session/${sessionId}/report`);

export const fetchChapterSessions = (chapterId: string) =>
  get<{ data: ChapterSession[] }>(`/chapter/${chapterId}/sessions`);

export const fetchTopicsSummary = () =>
  get<{ data: TopicSummary[] }>('/topics/summary');