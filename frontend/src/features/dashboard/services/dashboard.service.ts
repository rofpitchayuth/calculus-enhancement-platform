/**
 * dashboard.service.ts — Infrastructure / Data Access Layer
 * =================================================================
 * Unified service for all dashboard-related data fetching.
 */

import axios from 'axios';
import type { 
  DashboardStats, 
  ArchetypeKey, 
  UnifiedDashboardData,
  OverviewStats,
  ChapterProgress
} from "../types/dashboard.types";

import { API_BASE_URL as API_BASE } from '../../../shared/api/config';
const API_URL = `${API_BASE}/dashboard`;

/** Timeout for the dashboard stats request (10 seconds). */
const DASHBOARD_TIMEOUT_MS = 10_000;

// --- Mock Data ---

const ARCHETYPE_META: Record<ArchetypeKey, { label: string; description: string }> = {
  high_achiever: {
    label: "High Achiever 🏆",
    description: "You are consistently mastering new concepts and building on prior knowledge. Keep pushing — you're on the right track!",
  },
  careless: {
    label: "Careless Genius ⚡",
    description: "Your conceptual understanding is strong, but small errors cost you marks. Slow down on sign handling and constant terms to unlock your full potential.",
  },
  developing: {
    label: "Developing ⬆️",
    description: "Your mastery is growing with each attempt. Focus on the highlighted weak areas and you'll see a big jump soon.",
  },
  struggling: {
    label: "Needs Support 💪",
    description: "Don't give up — every expert was once a beginner. Review the fundamentals in your weakest skills and retry those topics.",
  },
  steady: {
    label: "Steady Learner 🎯",
    description: "You perform consistently across all topics. Challenge yourself with harder problems to break through to the next level.",
  },
};

const MOCK_DASHBOARD_STATS: DashboardStats = {
  archetype: { key: "developing", ...ARCHETYPE_META["developing"] },
  skills: [
    { skill: "Limits", mastery: 0.72 },
    { skill: "Derivatives", mastery: 0.65 },
    { skill: "Integrals", mastery: 0.48 },
    { skill: "Applications", mastery: 0.55 },
    { skill: "Series", mastery: 0.38 },
  ],
  progression: [
    { attempt: 1, mastery: 0.32, date: "2025-11-01" },
    { attempt: 2, mastery: 0.41, date: "2025-11-05" },
    { attempt: 3, mastery: 0.49, date: "2025-11-08" },
    { attempt: 4, mastery: 0.57, date: "2025-11-12" },
    { attempt: 5, mastery: 0.61, date: "2025-11-15" },
    { attempt: 6, mastery: 0.65, date: "2025-11-18" },
  ],
  weaknesses: [
    { error_code: "Sign Error", frequency: 7, skill: "Derivatives" },
    { error_code: "Forgot +C", frequency: 5, skill: "Integrals" },
    { error_code: "Chain Rule Misapplication", frequency: 4, skill: "Derivatives" },
  ],
  total_attempts: 6,
  average_mastery: 0.556,
};

const MOCK_OVERVIEW: OverviewStats = {
  totalChapters: "3 บท",
  averageScore: "75%",
  totalAttempts: "9 รอบ",
};

const MOCK_CHAPTER_PROGRESS: ChapterProgress = {
  limit: { completed: 75, total: 100 },
  differential: { completed: 78, total: 100 },
  integral: { completed: 65, total: 100 },
};

const MOCK_RECENT_ATTEMPTS = {
  data: [
    { id: 1, date: "2025-11-20", score: 85, chapter: "Limits" },
    { id: 2, date: "2025-11-18", score: 72, chapter: "Differential" },
    { id: 3, date: "2025-11-15", score: 68, chapter: "Integral" },
  ]
};

// --- Helpers ---

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return { 
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

function resolveArchetype(
  raw: Partial<DashboardStats["archetype"]> & { key: ArchetypeKey }
): DashboardStats["archetype"] {
  const meta = ARCHETYPE_META[raw.key] ?? ARCHETYPE_META["developing"];
  return {
    key: raw.key,
    label: raw.label ?? meta.label,
    description: raw.description ?? meta.description,
  };
}

// --- Service ---

export const dashboardService = {
  /**
   * Fetches all data needed for the unified dashboard.
   */
  async getUnifiedDashboardData(userId?: number): Promise<UnifiedDashboardData> {
    if (import.meta.env.VITE_USE_MOCK_DASHBOARD === "true") {
      console.info("[dashboardService] Forced mock mode active.");
      return new Promise((resolve) => {
        setTimeout(() => resolve({
          ...MOCK_DASHBOARD_STATS,
          overview: MOCK_OVERVIEW,
          chapterProgress: MOCK_CHAPTER_PROGRESS,
        }), 800);
      });
    }

    try {
      const statsUrl = userId
        ? `${API_BASE}/dashboard/stats?user_id=${userId}`
        : `${API_BASE}/dashboard/stats`;

      const [statsRes, overviewRes, progressRes] = await Promise.all([
        axios.get(statsUrl, { headers: getAuthHeaders(), timeout: DASHBOARD_TIMEOUT_MS }),
        axios.get(`${API_URL}/overview`, { headers: getAuthHeaders() }),
        axios.get(`${API_URL}/chapter-progress`, { headers: getAuthHeaders() })
      ]);

      const stats = statsRes.data as DashboardStats;

      return {
        ...stats,
        archetype: resolveArchetype(stats.archetype),
        overview: overviewRes.data,
        chapterProgress: progressRes.data.data
      };
    } catch (err: any) {
      console.warn("[dashboardService] Backend error or unreachable — using mock data.", err);
      return {
        ...MOCK_DASHBOARD_STATS,
        overview: MOCK_OVERVIEW,
        chapterProgress: MOCK_CHAPTER_PROGRESS,
      };
    }
  },

  // Keep individual methods for flexibility if needed
  getOverviewStats: async () => {
    const response = await axios.get(`${API_URL}/overview`, { headers: getAuthHeaders() });
    return response.data;
  },

  getChapterProgress: async () => {
    const response = await axios.get(`${API_URL}/chapter-progress`, { headers: getAuthHeaders() });
    return response.data;
  },

  getSkillsRadar: async () => {
    const response = await axios.get(`${API_URL}/skills-radar`, { headers: getAuthHeaders() });
    return response.data;
  },

  getRecentAttempts: async () => {
    if (import.meta.env.VITE_USE_MOCK_DASHBOARD === "true") {
      return MOCK_RECENT_ATTEMPTS;
    }
    const response = await axios.get(`${API_URL}/recent-attempts`, { headers: getAuthHeaders() });
    return response.data;
  },
};
