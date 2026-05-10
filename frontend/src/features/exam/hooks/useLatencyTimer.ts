import { useEffect, useRef } from "react";

export interface UseLatencyTimerReturn {
  stopAndGet: () => number;
  reset: () => void;
}

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
