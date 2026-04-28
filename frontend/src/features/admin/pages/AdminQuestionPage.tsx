/**
 * AdminQuestionPage.tsx — Presentation Layer (Orchestrator Page)
 * ==============================================================
 * The top-level Admin page for adding new questions using the HITL workflow.
 */
import { useAdminDraft } from "../hooks/useAdminDraft";
import { QuestionInputForm } from "../components/QuestionInputForm";
import { ExpertReviewForm } from "../components/ExpertReviewForm";

export function AdminQuestionPage() {
  const {
    draftInput,
    setDraftInput,
    analysis,
    setAnalysis,
    isDrafting,
    isSaving,
    error,
    successMessage,
    handleGenerateDraft,
    handleSaveQuestion,
  } = useAdminDraft();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* --- Header --- */}
        <div className="text-center">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            HITL Question Factory
          </h1>
          <p className="mt-2 text-lg text-slate-500">
            Create high-quality calculus questions with Human-in-the-Loop AI assistance.
          </p>
        </div>

        {/* --- Global Notifications --- */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-500 font-bold">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded shadow-sm animate-pulse">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-emerald-500 font-bold">✅</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-emerald-700 font-medium">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* --- Step 1: Input --- */}
        <QuestionInputForm
          input={draftInput}
          setInput={setDraftInput}
          onGenerate={handleGenerateDraft}
          isLoading={isDrafting}
        />

        {/* --- Step 2: Review (Conditional) --- */}
        {analysis && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ExpertReviewForm
              draftInput={draftInput}
              analysis={analysis}
              setAnalysis={setAnalysis}
              onSave={handleSaveQuestion}
              isSaving={isSaving}
            />
          </div>
        )}

        {/* --- Footer Note --- */}
        <div className="text-center text-slate-400 text-xs py-8">
          &copy; 2026 Calculus Enhancement Platform &middot; Administrative Tool &middot; Clean Architecture v1.2
        </div>
      </div>
    </div>
  );
}
