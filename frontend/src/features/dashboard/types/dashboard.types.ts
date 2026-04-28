/**
 * dashboard.types.ts — Domain / Entity Layer
 * ====================================================
 * Unified types for the Dashboard feature.
 */

import React from "react";

// --- UI Props ---

export type StatCardProps = {
  label: string;
  value: string;
  sub?: string;
  subClass?: string;
};

export type DashboardCardProps = {
  title?: string;
  children: React.ReactNode;
};

export type BloomBarProps = {
  label: string;
  percent: number;
};

export type ChapterSummary = {
  id: string;
  title: string;
  latestScore: number;
  attempts: number;
  trend: "up" | "down" | "steady";
};

export type CourseReportPageProps = {
  attemptId?: string;
};

export type ChapterDashboardPageProps = {
  chapterId?: string;
};

// --- DKT-GRU Analytics (Student Dashboard) ---

export type ArchetypeKey =
  | "high_achiever"
  | "careless"
  | "developing"
  | "struggling"
  | "steady";

export interface ArchetypeData {
  key: ArchetypeKey;
  label: string;
  description: string;
}

export interface SkillMastery {
  skill: string;
  mastery: number;
}

export interface ProgressionPoint {
  attempt: number;
  mastery: number;
  date?: string;
}

export interface WeaknessItem {
  error_code: string;
  frequency: number;
  skill: string;
}

export interface DashboardStats {
  archetype: ArchetypeData;
  skills: SkillMastery[];
  progression: ProgressionPoint[];
  weaknesses: WeaknessItem[];
  total_attempts: number;
  average_mastery: number;
}

// --- Overview Stats ---

export interface OverviewStats {
  totalChapters: string;
  averageScore: string;
  totalAttempts: string;
}

export interface ChapterProgress {
  [key: string]: {
    completed: number;
    total: number;
  };
}

export interface UnifiedDashboardData extends DashboardStats {
  overview: OverviewStats;
  chapterProgress: ChapterProgress;
}
