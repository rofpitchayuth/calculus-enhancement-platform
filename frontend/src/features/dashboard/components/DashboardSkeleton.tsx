/**
 * DashboardSkeleton.tsx — Presentation Component
 * ================================================
 * Renders animated skeleton placeholder cards for all 4 dashboard widgets
 * while data is being fetched.
 *
 * Rules enforced here:
 *   - No props, no state — purely structural placeholder.
 *   - Mirrors the exact grid layout of StudentDashboardPage so the
 *     skeleton-to-content transition is smooth with no layout shift.
 */

// ---------------------------------------------------------------------------
// Sub-components: individual skeleton cards
// ---------------------------------------------------------------------------

/** Reusable shimmer block with configurable size. */
function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded-xl ${className}`}
    />
  );
}

/** Skeleton for the ArchetypeCard widget. */
function ArchetypeSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <Shimmer className="h-3 w-32" />
          <Shimmer className="h-7 w-44" />
        </div>
        {/* Circle badge */}
        <Shimmer className="h-16 w-16 rounded-full" />
      </div>
      {/* Description lines */}
      <Shimmer className="h-3 w-full" />
      <Shimmer className="h-3 w-5/6" />
      <Shimmer className="h-3 w-4/6" />
      {/* Divider */}
      <Shimmer className="h-px w-full rounded-none" />
      {/* Stats row */}
      <div className="flex gap-6">
        <div className="flex flex-col gap-2">
          <Shimmer className="h-3 w-16" />
          <Shimmer className="h-6 w-10" />
        </div>
        <div className="flex flex-col gap-2">
          <Shimmer className="h-3 w-20" />
          <Shimmer className="h-6 w-12" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton for the SkillsRadarChart widget. */
function RadarSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
      <Shimmer className="h-5 w-36" />
      {/* Fake radar circle */}
      <div className="flex items-center justify-center">
        <Shimmer className="h-52 w-52 rounded-full" />
      </div>
      <Shimmer className="h-3 w-40 mx-auto" />
    </div>
  );
}

/** Skeleton for the LearningCurveChart widget. */
function LineSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
      <Shimmer className="h-5 w-40" />
      {/* Fake chart bars to suggest a line chart */}
      <div className="flex items-end gap-3 h-40 px-4">
        {[60, 80, 55, 90, 75, 95].map((h, i) => (
          <div
            key={i}
            className="flex-1 animate-pulse bg-gray-200 rounded-t-lg"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <Shimmer className="h-3 w-32 mx-auto" />
    </div>
  );
}

/** Skeleton for the WeaknessesPanel widget. */
function WeaknessesSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
      <Shimmer className="h-5 w-40" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
          <Shimmer className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <Shimmer className="h-3 w-40" />
            <Shimmer className="h-2 w-24" />
          </div>
          <Shimmer className="h-6 w-10 rounded-full flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * DashboardSkeleton
 *
 * Full-page skeleton that mirrors the StudentDashboardPage layout.
 * Renders while isLoading = true in useDashboard.
 */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page header skeleton */}
      <div className="flex flex-col gap-2">
        <Shimmer className="h-8 w-56" />
        <Shimmer className="h-4 w-80" />
      </div>

      {/* Top row: Archetype + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ArchetypeSkeleton />
        <RadarSkeleton />
      </div>

      {/* Bottom section: Learning Curve (full width) */}
      <LineSkeleton />

      {/* Weaknesses panel */}
      <WeaknessesSkeleton />
    </div>
  );
}
