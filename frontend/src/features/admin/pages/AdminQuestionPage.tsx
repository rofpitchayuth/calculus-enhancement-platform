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
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* --- Header Section --- */}
        <div className="text-center py-4">
          <h1 className="text-4xl font-black text-[#003B62] tracking-tight mb-2">
            HITL <span className="text-blue-500">Question Factory</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] bg-blue-50 inline-block px-4 py-1 rounded-full border border-blue-100">
            ระบบสร้างข้อสอบคุณภาพสูง (Expert Review)
          </p>
        </div>

        {/* --- Global Notifications --- */}
        <div className="space-y-4">
          {error && (
            <div className="bg-white border-l-8 border-red-500 p-6 rounded-2xl shadow-sm animate-in fade-in zoom-in duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 p-3 rounded-full">
                  <span className="text-red-600 text-xl">⚠️</span>
                </div>
                <div className="ml-5">
                  <h3 className="text-sm font-bold text-red-900 uppercase tracking-wider">System Error</h3>
                  <p className="text-sm text-red-700 font-medium mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-white border-l-8 border-emerald-500 p-6 rounded-2xl shadow-sm animate-in fade-in zoom-in duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-emerald-100 p-3 rounded-full">
                  <span className="text-emerald-600 text-xl">✅</span>
                </div>
                <div className="ml-5">
                  <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wider">Success</h3>
                  <p className="text-sm text-emerald-700 font-medium mt-1">{successMessage}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- Step 1: Input --- */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-slate-50/50 border-b border-slate-100 px-10 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-200">1</span>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Input Question Details</h2>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-tighter">Raw Data Entry</p>
              </div>
            </div>
          </div>
          <div className="p-10">
            <QuestionInputForm
              input={draftInput}
              setInput={setDraftInput}
              onGenerate={handleGenerateDraft}
              isLoading={isDrafting}
            />
          </div>
        </div>

        {/* --- Step 2: Review (Conditional) --- */}
        {analysis && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="bg-emerald-50/50 border-b border-emerald-100 px-10 py-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-200">2</span>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Expert Review & Finalization</h2>
                  <p className="text-xs text-emerald-600/60 font-bold uppercase tracking-tighter">AI Analysis Ready</p>
                </div>
              </div>
              <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-200">AI Generated Draft</span>
            </div>
            <div className="p-10">
              <ExpertReviewForm
                draftInput={draftInput}
                analysis={analysis}
                setAnalysis={setAnalysis}
                onSave={handleSaveQuestion}
                isSaving={isSaving}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
