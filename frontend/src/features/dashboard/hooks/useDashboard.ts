/**
 * useDashboard.ts — Presentation Layer (Data Orchestration Hook)
 * ==============================================================
 * Manages loading, error, and data states for the Unified Dashboard page.
 */

import { useState, useEffect, useCallback } from "react";
import { dashboardService } from "../services/dashboard.service";
import type { UnifiedDashboardData } from "../types/dashboard.types";

export interface UseDashboardReturn {
  data: UnifiedDashboardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * useDashboard
 *
 * Fetches the unified dashboard data (Overview + Student Analytics)
 * on mount and exposes { data, isLoading, error, refetch }.
 */
export function useDashboard(userId?: number): UseDashboardReturn {
  const [data, setData] = useState<UnifiedDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchTick, setFetchTick] = useState<number>(0);

  const refetch = useCallback(() => {
    setFetchTick((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await dashboardService.getUnifiedDashboardData(userId);
        if (!cancelled) {
          setData(result);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : "An unexpected error occurred while loading your dashboard.";
          setError(message);
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [userId, fetchTick]);

  return { data, isLoading, error, refetch };
}
