/**
 * ArchetypeCard.tsx — Presentation Component
 * ===========================================
 * Displays the student's behavioral archetype as a styled badge with
 * an encouraging description and animated gradient border.
 *
 * Rules enforced here:
 *   - Purely presentational: receives all data via props, zero internal state.
 *   - No API calls, no hooks (except standard React).
 *   - No business logic — archetype resolution happened in the service layer.
 */

import type { ArchetypeData, ArchetypeKey } from "../types/dashboard.types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ArchetypeCardProps {
  archetype: ArchetypeData;
  totalAttempts: number;
  averageMastery: number;
}

// ---------------------------------------------------------------------------
// Styling helpers
// ---------------------------------------------------------------------------

/** Maps each archetype key to a Tailwind-compatible color configuration. */
const ARCHETYPE_STYLES: Record<
  ArchetypeKey,
  { gradient: string; badgeBg: string; badgeText: string; glow: string }
> = {
  high_achiever: {
    gradient: "from-amber-400 via-orange-400 to-yellow-300",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    glow: "shadow-amber-200",
  },
  careless: {
    gradient: "from-violet-500 via-purple-400 to-fuchsia-400",
    badgeBg: "bg-violet-50",
    badgeText: "text-violet-700",
    glow: "shadow-violet-200",
  },
  developing: {
    gradient: "from-blue-500 via-indigo-400 to-cyan-400",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    glow: "shadow-blue-200",
  },
  struggling: {
    gradient: "from-rose-500 via-red-400 to-pink-400",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
    glow: "shadow-rose-200",
  },
  steady: {
    gradient: "from-emerald-500 via-teal-400 to-green-400",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    glow: "shadow-emerald-200",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * ArchetypeCard
 *
 * Renders the student's KT-assigned behavioral archetype with:
 *   - Animated gradient border unique to each archetype
 *   - Badge label + description
 *   - Summary stats (total attempts, average mastery)
 */
export function ArchetypeCard({
  archetype,
  totalAttempts,
  averageMastery,
}: ArchetypeCardProps) {
  const styles = ARCHETYPE_STYLES[archetype.key] ?? ARCHETYPE_STYLES["developing"];
  const masteryPercent = Math.round(averageMastery * 100);

  return (
    <div
      className={`relative rounded-2xl p-[2px] bg-gradient-to-br ${styles.gradient} shadow-xl ${styles.glow}`}
    >
      {/* Inner card */}
      <div className="bg-white rounded-[14px] p-6 h-full flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
              Your Learning Archetype
            </p>
            <h2
              className={`text-2xl font-extrabold ${styles.badgeText}`}
            >
              {archetype.label}
            </h2>
          </div>

          {/* Mastery circle badge */}
          <div
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${styles.gradient} shadow-md`}
          >
            <span className="text-white font-black text-lg leading-none">
              {masteryPercent}
            </span>
            <span className="text-white text-[10px] font-semibold opacity-80">
              %
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed">
          {archetype.description}
        </p>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Stats row */}
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Attempts
            </p>
            <p className="text-xl font-bold text-gray-800">{totalAttempts}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Avg. Mastery
            </p>
            <p className={`text-xl font-bold ${styles.badgeText}`}>
              {masteryPercent}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
