/**
 * DashboardOverviewPage.tsx — Presentation Layer (Unified Dashboard)
 * ====================================================================
 * The single, consolidated dashboard for students, merging general
 * overview and DKT-GRU analytics.
 */

import { useDashboard } from "../hooks/useDashboard";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  StatCard,
  ChapterCard,
  ArchetypeCard,
  SkillsRadarChart,
  LearningCurveChart,
  WeaknessesPanel,
  DashboardSkeleton,
  ProgressBarComponent,
} from "../components";
import { MOCK_CHAPTERS } from "../data/mockData";

// --- Sub-components ---

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

function SectionCard({ title, subtitle, children, className = "" }: SectionCardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 ${className}`}>
      <div>
        <h3 className="text-base font-bold text-[#003B62]">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <span className="text-5xl">⚠️</span>
      <h2 className="text-xl font-bold text-gray-700">Dashboard Unavailable</h2>
      <p className="text-sm text-gray-500 max-w-sm">{message}</p>
      <button
        onClick={onRetry}
        className="mt-2 px-6 py-2 rounded-full bg-[#003B62] text-white text-sm font-semibold hover:bg-blue-900 active:scale-95 transition-all"
      >
        Try Again
      </button>
    </div>
  );
}

export function DashboardOverviewPage() {
  const { user } = useAuth();
  const userId = user?.id as number | undefined;

  const { data, isLoading, error, refetch } = useDashboard(userId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50/30 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-blue-50/30 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <ErrorState message={error ?? "Data could not be loaded."} onRetry={refetch} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50/30 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* --- Page Header --- */}
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-extrabold text-[#003B62] tracking-tight">
            PUNPUN's DASHBOARD
          </h1>
          <p className="text-sm text-gray-500">
            Welcome back, <span className="font-semibold text-blue-600">{user?.full_name ?? "Student"}</span>. 
            Here is your personalized learning overview.
          </p>
        </div>

        {/* --- Top Row: Archetype & General Stats --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <ArchetypeCard
              archetype={data.archetype}
              totalAttempts={data.total_attempts}
              averageMastery={data.average_mastery}
            />
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="จำนวนบททั้งหมด" value={data.overview.totalChapters} />
            <StatCard label="คะแนนเฉลี่ยรวม" value={data.overview.averageScore} />
            <StatCard label="จำนวนรอบที่ทำแบบทดสอบ" value={data.overview.totalAttempts} />
          </div>
        </div>

        {/* --- Middle Row: Skills Radar & Learning Curve --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <SectionCard
            title="Skills Mastery Radar"
            subtitle="Per-topic mastery estimated by AI (0% – 100%)"
            className="lg:col-span-4"
          >
            <div className="flex-1 flex items-center justify-center">
              <SkillsRadarChart skills={data.skills} height={300} />
            </div>
          </SectionCard>

          <SectionCard
            title="Learning Curve"
            subtitle="Overall mastery progression across quiz attempts"
            className="lg:col-span-8"
          >
            <LearningCurveChart progression={data.progression} height={300} />
          </SectionCard>
        </div>

        {/* --- Bottom Row: Weaknesses & Chapter Progress --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <SectionCard
            title="Recent Weaknesses"
            subtitle="Top recurring error patterns from latest attempts"
            className="lg:col-span-4"
          >
            <WeaknessesPanel weaknesses={data.weaknesses} />
          </SectionCard>

          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Chapter Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {MOCK_CHAPTERS.map((chapter) => (
                <ChapterCard key={chapter.id} chapter={chapter} stats={data.overview} />
              ))}
            </div>

            {/* Detailed Progress Bars */}
            <SectionCard title="ความก้าวหน้าการเรียนแต่ละบท">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {Object.entries(data.chapterProgress).map(([chapter, progress]) => (
                  <div key={chapter}>
                    <h4 className="font-semibold text-gray-700 mb-2 capitalize text-sm">
                      {chapter === "limit" ? "Limits" : chapter === "differential" ? "Differential" : "Integral"}
                    </h4>
                    <ProgressBarComponent
                      label="ความสำเร็จ"
                      current={progress.completed}
                      total={progress.total}
                      color="bg-blue-500"
                    />
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

      </div>
    </div>
  );
}
