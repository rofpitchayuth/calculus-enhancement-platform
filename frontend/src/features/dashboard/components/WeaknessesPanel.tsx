/**
 * WeaknessesPanel.tsx — Presentation Component
 * =============================================
 * Displays the top 2–3 most frequent error codes from recent quiz attempts.
 *
 * Rules enforced here:
 *   - Purely presentational: receives all data via props, zero internal state.
 *   - Renders at most MAX_ITEMS items (guards against oversized API responses).
 *   - No API calls, no service imports.
 */

import { mapErrorCodeToThai } from "../../exam/utils/errorMapper";
import type { WeaknessItem } from "../types/dashboard.types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum number of weakness items to display (top N by frequency). */
const MAX_ITEMS = 3;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface WeaknessesPanelProps {
  weaknesses: WeaknessItem[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns a severity color class based on frequency rank (highest = most severe). */
function getSeverityStyles(rank: number): {
  ring: string;
  badge: string;
  badgeText: string;
  dot: string;
} {
  if (rank === 0) {
    return {
      ring: "ring-red-200 bg-red-50",
      badge: "bg-red-100",
      badgeText: "text-red-700",
      dot: "bg-red-500",
    };
  }
  if (rank === 1) {
    return {
      ring: "ring-orange-200 bg-orange-50",
      badge: "bg-orange-100",
      badgeText: "text-orange-700",
      dot: "bg-orange-400",
    };
  }
  return {
    ring: "ring-yellow-200 bg-yellow-50",
    badge: "bg-yellow-100",
    badgeText: "text-yellow-700",
    dot: "bg-yellow-400",
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * WeaknessesPanel
 *
 * Renders the top N error codes the student makes most frequently.
 * Items are displayed in descending frequency order (the service should
 * pre-sort them, but this component renders them as-is).
 */
export function WeaknessesPanel({ weaknesses }: WeaknessesPanelProps) {
  const topItems = weaknesses.slice(0, MAX_ITEMS);

  if (topItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <span className="text-3xl mb-2">🎉</span>
        <p className="text-sm font-semibold text-gray-600">No recurring errors!</p>
        <p className="text-xs text-gray-400 mt-1">
          Keep it up — you're making very few mistakes.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {topItems.map((item, index) => {
        const styles = getSeverityStyles(index);

        return (
          <div
            key={`${item.error_code}-${index}`}
            className={`flex items-center gap-4 p-4 rounded-xl ring-1 ${styles.ring} transition-all hover:shadow-md`}
          >
            {/* Rank indicator */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white ${styles.dot}`}
            >
              {index + 1}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">
                {mapErrorCodeToThai(item.error_code)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{item.skill}</p>
            </div>

            {/* Frequency badge */}
            <span
              className={`flex-shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${styles.badge} ${styles.badgeText}`}
            >
              ×{item.frequency}
            </span>
          </div>
        );
      })}

      {/* Motivational note */}
      <p className="text-xs text-gray-400 text-center pt-1">
        Based on your last {/* display attempt count if available */}
        recent quiz attempts. Focus on these to boost your mastery.
      </p>
    </div>
  );
}
