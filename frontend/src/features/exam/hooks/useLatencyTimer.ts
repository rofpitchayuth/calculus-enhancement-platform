/**
 * useLatencyTimer.ts — Presentation Layer (Focused Hook)
 * ========================================================
 * Single responsibility: measure the elapsed time between question render
 * and the moment the student commits an answer.
 *
 * Design notes:
 *   - Uses performance.now() instead of Date.now() for sub-millisecond
 *     precision and monotonic behaviour (immune to clock skew).
 *   - The timer starts automatically on mount (when the question renders).
 *   - stopAndGet() is idempotent: multiple calls return the same value.
 *   - reset() is called by the parent hook when advancing to the next question.
 */

import { useEffect, useRef } from "react";

export interface UseLatencyTimerReturn {
  /**
   * Stop the timer and return the elapsed time in seconds (2 decimal places).
   * Idempotent: calling it again returns the same frozen value.
   */
  stopAndGet: () => number;

  /**
   * Restart the timer from zero.  Call this when the question changes.
   */
  reset: () => void;
}

/**
 * Measures response latency from the moment the hook mounts (question render)
 * until stopAndGet() is called (answer submitted).
 */
export function useLatencyTimer(): UseLatencyTimerReturn {
  // Timestamp of the last reset (or initial mount), in ms from performance.now()
  const startRef = useRef<number>(performance.now());

  // Frozen elapsed time after the first stopAndGet() call.
  // null means the timer is still running.
  const frozenRef = useRef<number | null>(null);

  // Start the timer as soon as the component mounts.
  useEffect(() => {
    startRef.current = performance.now();
    frozenRef.current = null;
  }, []);

  const stopAndGet = (): number => {
    // Return the already-frozen value if stopAndGet was called before.
    if (frozenRef.current !== null) return frozenRef.current;

    const elapsed = parseFloat(
      ((performance.now() - startRef.current) / 1000).toFixed(2)
    );
    frozenRef.current = elapsed;
    return elapsed;
  };

  const reset = (): void => {
    startRef.current = performance.now();
    frozenRef.current = null;
  };

  return { stopAndGet, reset };
}
