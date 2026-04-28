/**
 * GraderLoadingOverlay.tsx — Presentational Component
 * =====================================================
 * Shown briefly while the answer is being recorded and grading is retrieved.
 */

export function GraderLoadingOverlay() {
  return (
    <div className="mt-6 flex flex-col items-center justify-center gap-5 rounded-2xl border border-slate-100 bg-slate-50 p-8 shadow-inner">
      {/* Animated spinner ring */}
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
      </div>

      <div className="text-center">
        <p className="text-base font-semibold text-slate-700">
          กำลังตรวจคำตอบของคุณ…
        </p>
        <p className="mt-1 text-xs text-slate-400">
          กรุณารอสักครู่
        </p>
      </div>
    </div>
  );
}
