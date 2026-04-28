/**
 * QuizPage.tsx — Page Component (Presentation Layer)
 * ====================================================
 * The top-level page for the student quiz assessment flow.
 *
 * This component is a pure orchestrator:
 *   - It reads state from useQuizFlow.
 *   - It renders child components based on that state.
 *   - It contains ZERO business logic, API calls, or timers.
 *
 * State machine rendered here:
 *   LOADING_SESSION  → Spinner (quiz session loading from backend)
 *   SESSION_ERROR    → Error message + retry button
 *   QUESTION_IDLE    → QuestionCard + Submit button
 *   QUESTION_GRADING → QuestionCard (disabled) + GraderLoadingOverlay
 *   QUESTION_DONE    → QuestionCard (disabled) + FeedbackPanel + Next button
 *   SESSION_ENDED    → Summary screen (QuizEndResult)
 */

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/hooks/useAuth";
import { useQuizFlow } from "../hooks/useQuizFlow";
import { QuestionCard } from "../components/QuestionCard";
import { GraderLoadingOverlay } from "../components/GraderLoadingOverlay";
import { mapErrorCodeToThai } from "../utils/errorMapper";
import { renderMathText } from "../components/mathRenderer";

export default function QuizPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // handleFinish navigates back to /home after cleaning up quiz state.
  const onFinish = () => navigate("/home");

  const {
    // Quiz session state
    quizLoading,
    quizError,
    currentQuestion,
    currentIndex,
    totalQuestions,
    quizEndResult,
    // Per-question state
    selectedChoice,
    setSelectedChoice,
    // Grader state
    graderStatus,
    graderResult,
    graderError,
    // Actions
    startQuiz,
    handleSubmit,
    handleNext,
    handleFinish,
  } = useQuizFlow(onFinish);

  // Guard: start the quiz once per mount (React 18 StrictMode fires effects twice
  // in dev; the hasStarted ref prevents a duplicate session from being created).
  const hasStarted = useRef(false);
  useEffect(() => {
    if (user?.id && !hasStarted.current) {
      hasStarted.current = true;
      startQuiz(user.id, 5);
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const isLastQuestion = currentIndex === totalQuestions - 1;
  const isGrading = graderStatus === "loading";
  const hasResult = graderStatus === "done" && graderResult !== null;

  // ── State: loading initial quiz session ─────────────────────────────────
  if (quizLoading && !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">กำลังโหลดแบบทดสอบ…</p>
        </div>
      </div>
    );
  }

  // ── State: session error ────────────────────────────────────────────────
  if (quizError || (!currentQuestion && !quizLoading && !quizEndResult)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4 font-medium">{quizError ?? "ไม่พบแบบทดสอบ"}</p>
          <button
            onClick={() => user?.id && startQuiz(user.id, 5)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ลองอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  // ── State: session ended → summary screen ───────────────────────────────
  if (quizEndResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-[#003B62] mb-6">
            สรุปผลการทำแบบทดสอบ
          </h2>

          {/* Score banner */}
          <div className="flex justify-center mb-8 gap-6">
            <div className="bg-blue-50 p-6 rounded-xl text-center min-w-[180px]">
              <p className="text-gray-600 font-medium">คะแนนของคุณ</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">
                {Math.round(quizEndResult.total_score)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ถูก{" "}
                {Math.round(
                  (quizEndResult.total_score / 100) * quizEndResult.total_questions
                )}{" "}
                / {quizEndResult.total_questions} ข้อ
              </p>
            </div>

            {/* AI archetype badge & Mastery Indicator */}
            <div className="bg-indigo-50 p-6 rounded-xl text-center min-w-[200px] flex flex-col justify-center">
              <p className="text-gray-600 font-medium">AI Analysis</p>
              
              {quizEndResult.skill_mastery !== null && quizEndResult.skill_mastery !== undefined ? (
                <div className="mt-2">
                  <p className="text-lg font-bold text-indigo-700">
                    {quizEndResult.student_profile || "Developing (Average)"}
                  </p>
                  
                  {/* Mastery Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-indigo-600">Skill Mastery</span>
                      <span className="text-xs font-bold text-indigo-700">
                        {(quizEndResult.skill_mastery * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-indigo-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-1000" 
                        style={{ width: `${quizEndResult.skill_mastery * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-sm text-gray-400 italic">
                    AI Analysis temporarily unavailable
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Per-question summary list */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
              รายละเอียดแต่ละข้อ
            </h3>
            {quizEndResult.session_summary.map((item, idx) => {
              const isItemCorrect = item.is_correct || item.error_code === 'correct_answer';
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-l-4 ${isItemCorrect
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-rose-500 bg-rose-50"
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-gray-700">
                      ข้อที่ {item.question_number}
                    </span>
                    {isItemCorrect ? (
                      <span className="text-emerald-600 font-bold">✓ ถูกต้อง</span>
                    ) : (
                      <span className="text-rose-600 font-bold">✗ ผิด</span>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">เรื่อง:</span>{" "}
                      {item.main_topic ?? "-"} / {item.sub_topic ?? "-"}
                    </p>
                    {item.error_code && (
                      <div className={`mt-3 p-3 bg-white rounded border ${isItemCorrect ? 'border-emerald-200' : 'border-rose-200'}`}>
                        <p className={`${isItemCorrect ? 'text-emerald-700' : 'text-rose-700'} font-medium mb-1`}>
                          {mapErrorCodeToThai(item.error_code)}
                        </p>
                        <p className="text-gray-500 text-xs">
                          คำตอบที่เลือก: {item.user_answer}
                        </p>
                        {item.feedback_text && (
                          <div className="mt-2 pt-2 border-t border-gray-100 text-gray-700 leading-relaxed">
                            {renderMathText(item.feedback_text)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            )
            }
          </div>

          {/* Finish button & Adaptive Next Steps */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h3 className="text-lg font-bold text-center text-gray-800 mb-6">
              เรียนรู้ต่อในระดับที่คุณต้องการ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <button
                onClick={() => user?.id && startQuiz(user.id, 5)} // Default to normal for now
                className="flex flex-col items-center p-4 rounded-2xl border-2 border-indigo-100 bg-indigo-50 hover:border-indigo-300 transition-all group"
              >
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🚀</span>
                <span className="font-bold text-indigo-700">ท้าทายตัวเอง</span>
                <span className="text-xs text-indigo-500 mt-1">ขอโจทย์ที่ยากขึ้น</span>
              </button>

              <button
                onClick={() => user?.id && startQuiz(user.id, 5)}
                className="flex flex-col items-center p-4 rounded-2xl border-2 border-blue-100 bg-blue-50 hover:border-blue-300 transition-all group"
              >
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🎯</span>
                <span className="font-bold text-blue-700">ฝึกฝนต่อ</span>
                <span className="text-xs text-blue-500 mt-1">ระดับปัจจุบัน</span>
              </button>

              <button
                onClick={() => user?.id && startQuiz(user.id, 5)}
                className="flex flex-col items-center p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 hover:border-gray-300 transition-all group"
              >
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📖</span>
                <span className="font-bold text-gray-700">ทบทวนพื้นฐาน</span>
                <span className="text-xs text-gray-500 mt-1">ขอโจทย์ง่ายลง</span>
              </button>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleFinish}
                className="px-10 py-3 text-gray-500 hover:text-gray-700 font-medium transition"
              >
                ← กลับสู่หน้าหลัก
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Guard: current question must exist to render the main flow ──────────
  if (!currentQuestion) return null;

  // ── State: main quiz flow ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">

        {/* Question card — disabled when grader is in-flight or done */}
        <QuestionCard
          question={currentQuestion}
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          selectedChoice={selectedChoice}
          onChoiceSelect={setSelectedChoice}
          disabled={isGrading || hasResult}
        />

        {/* ── Grader in-flight overlay ──────────────────────────────── */}
        {isGrading && <GraderLoadingOverlay />}

        {/* ── Grader error notice ───────────────────────────────────── */}
        {graderError && !isGrading && !hasResult && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-semibold">⚠️ ไม่สามารถรับผลจาก AI Grader:</p>
            <p className="mt-1">{graderError}</p>
            <p className="mt-2 text-xs text-amber-600">
              กดปุ่มด้านล่างเพื่อส่งคำตอบอีกครั้ง หรือข้ามไปข้อถัดไป
            </p>
          </div>
        )}

        {/* ── Action buttons (shown after answer is submitted) ── */}
        {hasResult && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => user?.id && handleNext(user.id)}
              className="px-12 py-3 bg-blue-600 text-white rounded-full font-semibold text-lg shadow-lg hover:bg-blue-700 transition-all active:scale-95"
            >
              {isLastQuestion ? "ดูสรุปผลการสอบ" : "ทำข้อถัดไป"}
            </button>
          </div>
        )}

        {/* ── Action buttons (hidden while grader result is visible) ── */}
        {!hasResult && (
          <div className="mt-8 flex items-center justify-center gap-4">
            {/* Submit button — primary action */}
            <button
              id="quiz-submit-btn"
              onClick={() => user?.id && handleSubmit(user.id)}
              disabled={isGrading || !selectedChoice}
              className={[
                "px-12 py-3 rounded-full font-semibold text-lg shadow-lg transition-all duration-200",
                "active:scale-95",
                isGrading || !selectedChoice
                  ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                  : "bg-yellow-400 text-gray-800 hover:bg-yellow-500",
              ].join(" ")}
            >
              {isGrading
                ? "AI กำลังวิเคราะห์…"
                : isLastQuestion
                  ? "ส่งคำตอบทั้งหมด"
                  : "ส่งคำตอบ"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
