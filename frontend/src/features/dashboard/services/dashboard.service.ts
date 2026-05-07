// src/features/dashboard/services/dashboard.service.ts
// Centralized API service for the dashboard feature.
// All methods return the exact TypeScript types that mirror the backend schemas.

import apiClient from '../../../shared/api/apiClient';
import type {
  DashboardOverviewStats,
  DashboardChapterProgressResponse,
  DashboardSkillsRadarResponse,
  DashboardRecentAttemptsResponse,
  ChapterStatsResponse,
  ChapterAttemptsResponse,
  ChapterSessionsResponse,
  SessionReportResponse,
  TopicsSummaryResponse,
  SkillTagMasteryResponse,
} from '../types/dashboard.types';

// Proficiency thresholds mirroring the backend's PROFICIENCY_THRESHOLDS
const PROFICIENCY_THRESHOLDS: [number, string][] = [
  [80, 'Excellent'],
  [60, 'Good'],
  [40, 'Developing'],
  [0, 'Beginner'],
];

export const dashboardService = {
  /**
   * Fetches high-level aggregated metrics for the dashboard home.
   */
  fetchOverviewStats: async (): Promise<DashboardOverviewStats> => {
    const response = await apiClient.get<DashboardOverviewStats>('/dashboard/overview');
    return response.data;
  },

  /**
   * Retrieves chapter completion progress.
   */
  fetchChapterProgress: async (): Promise<DashboardChapterProgressResponse> => {
    const response = await apiClient.get<DashboardChapterProgressResponse>('/dashboard/chapter-progress');
    return response.data;
  },

  /**
   * Fetches skills radar chart data (aggregated by backend).
   */
  fetchSkillsRadar: async (): Promise<DashboardSkillsRadarResponse> => {
    const response = await apiClient.get<DashboardSkillsRadarResponse>('/dashboard/skills-radar');
    return response.data;
  },

  /**
   * Retrieves a list of the most recent quiz attempts across all chapters.
   */
  fetchRecentAttempts: async (): Promise<DashboardRecentAttemptsResponse> => {
    const response = await apiClient.get<DashboardRecentAttemptsResponse>('/dashboard/recent-attempts');
    return response.data;
  },

  /**
   * Fetches detailed analytics for a specific chapter.
   */
  fetchChapterStats: async (chapterId: string): Promise<ChapterStatsResponse> => {
    const response = await apiClient.get<ChapterStatsResponse>(`/dashboard/chapter/${chapterId}/stats`);
    return response.data;
  },

  /**
   * Retrieves history of attempts for a specific chapter.
   */
  fetchChapterAttempts: async (chapterId: string): Promise<ChapterAttemptsResponse> => {
    const response = await apiClient.get<ChapterAttemptsResponse>(`/dashboard/chapter/${chapterId}/attempts`);
    return response.data;
  },

  /**
   * Fetches list of sessions for navigation in chapter dashboard.
   */
  fetchChapterSessions: async (chapterId: string): Promise<ChapterSessionsResponse> => {
    const response = await apiClient.get<ChapterSessionsResponse>(`/dashboard/chapter/${chapterId}/sessions`);
    return response.data;
  },

  /**
   * Retrieves the comprehensive session/report view for a specific attempt.
   */
  fetchSessionReport: async (sessionId: number): Promise<SessionReportResponse> => {
    const response = await apiClient.get<SessionReportResponse>(`/dashboard/session/${sessionId}/report`);
    return response.data;
  },

  /**
   * Standard summary for topic cards on the home page.
   */
  fetchTopicsSummary: async (): Promise<TopicsSummaryResponse> => {
    const response = await apiClient.get<TopicsSummaryResponse>('/dashboard/topics/summary');
    return response.data;
  },

  /**
   * Per-sub_topic accuracy: top-5 strengths + bottom-5 weaknesses.
   * Endpoint: GET /dashboard/skill-tags/mastery
   */
  fetchSkillTagsMastery: async (): Promise<SkillTagMasteryResponse> => {
    const response = await apiClient.get<SkillTagMasteryResponse>('/dashboard/skill-tags/mastery');
    return response.data;
  },

  /**
   * Client-side utility: converts a numeric accuracy percentage to a proficiency label.
   * Mirrors the backend's PROFICIENCY_THRESHOLDS logic.
   */
  getProficiencyLevel: (score: number): string => {
    for (const [threshold, label] of PROFICIENCY_THRESHOLDS) {
      if (score >= threshold) return label;
    }
    return 'Beginner';
  },
};

export default dashboardService;
