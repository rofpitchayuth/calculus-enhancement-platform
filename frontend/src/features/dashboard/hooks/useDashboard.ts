// src/features/dashboard/hooks/useDashboard.ts
// Custom hooks for fetching and managing dashboard data.
// Each hook owns its own loading/error state and exposes a refetch callback.

import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboard.service';
import type {
  DashboardOverviewStats,
  RadarSkill,
  RecentAttempt,
  ChapterStatsResponse,
  ChapterAttemptRecord,
  ChapterSession,
  SessionReportResponse,
  TopicSummary,
  ChapterProgressItem,
} from '../types/dashboard.types';

/**
 * Fetches all four overview endpoints in parallel.
 * Exposes `chapterProgress` as a flat list for UI components,
 * and `loading` / `isLoading` (same reference) for page-level guards.
 */
export function useDashboardOverview() {
  const [overviewStats, setOverviewStats] = useState<DashboardOverviewStats | null>(null);
  const [chapterProgress, setChapterProgress] = useState<ChapterProgressItem[]>([]);
  const [radarData, setRadarData] = useState<RadarSkill[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<RecentAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [overview, progress, radar, attempts] = await Promise.all([
        dashboardService.fetchOverviewStats(),
        dashboardService.fetchChapterProgress(),
        dashboardService.fetchSkillsRadar(),
        dashboardService.fetchRecentAttempts(),
      ]);

      setOverviewStats(overview);
      setRadarData(radar.data);
      setRecentAttempts(attempts.data);

      // Transform the progress dict into a flat array for UI components
      const mappedProgress = Object.entries(progress.data).map(([topic, stats]) => ({
        chapter: topic,
        score: stats.completed,
        total: stats.total,
      }));
      setChapterProgress(mappedProgress);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    overviewStats,
    chapterProgress,
    // Alias: the overview page destructures `chapterList` instead of `chapterProgress`
    chapterList: chapterProgress,
    radarData,
    recentAttempts,
    isLoading,
    // Alias: the overview page destructures `loading` instead of `isLoading`
    loading: isLoading,
    error,
    refetch: load,
  };
}

/**
 * Fetches chapter-level stats, attempt history, and session list in parallel.
 */
export function useChapterStats(chapterId: string) {
  const [stats, setStats] = useState<ChapterStatsResponse | null>(null);
  const [attempts, setAttempts] = useState<ChapterAttemptRecord[]>([]);
  const [sessions, setSessions] = useState<ChapterSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!chapterId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, attemptsData, sessionsData] = await Promise.all([
        dashboardService.fetchChapterStats(chapterId),
        dashboardService.fetchChapterAttempts(chapterId),
        dashboardService.fetchChapterSessions(chapterId),
      ]);
      setStats(statsData);
      setAttempts(attemptsData.data);
      setSessions(sessionsData.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load chapter analytics');
    } finally {
      setIsLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    load();
  }, [load]);

  return { stats, attempts, sessions, isLoading, error, refetch: load };
}

/**
 * Fetches a single session report AND the chapter's session list
 * so the CourseReportPage can render both the report and the
 * session navigation dropdown.
 */
export function useSessionReport(chapterId: string, sessionId: number) {
  const [report, setReport] = useState<SessionReportResponse | null>(null);
  const [sessions, setSessions] = useState<ChapterSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!sessionId) return;
    setIsLoading(true);
    setError(null);
    try {
      // Fetch report and session list in parallel
      const [reportData, sessionsData] = await Promise.all([
        dashboardService.fetchSessionReport(sessionId),
        dashboardService.fetchChapterSessions(chapterId),
      ]);
      setReport(reportData);
      setSessions(sessionsData.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load session report');
    } finally {
      setIsLoading(false);
    }
  }, [chapterId, sessionId]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    report,
    sessions,
    isLoading,
    // Alias: CourseReportPage destructures `loading`
    loading: isLoading,
    error,
    refetch: load,
  };
}

/**
 * Fetches the topic summary list for the AllDashboard page.
 */
export function useTopicsSummary() {
  const [topics, setTopics] = useState<TopicSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await dashboardService.fetchTopicsSummary();
      setTopics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load topic list');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { topics, isLoading, error, refetch: load };
}
