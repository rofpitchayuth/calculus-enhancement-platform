import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../auth/hooks/useAuth";
import { useQuizFlow } from "../hooks/useQuizFlow";
import { QuestionCard } from "../components/QuestionCard";
import { GraderLoadingOverlay } from "../components/GraderLoadingOverlay";
import { mapErrorCodeToThai } from "../utils/errorMapper";
import { renderMathText } from "../components/mathRenderer";

const TOPIC_MAPPER: Record<string, string> = {
  limits_and_continuity: 'LIMIT',
  limit: 'LIMIT',
  derivatives: 'DIFFERENTIAL',
  differential: 'DIFFERENTIAL', 
  integrals: 'INTEGRAL',
  integral: 'INTEGRAL',
  applications: 'APPLICATIONS',
};

const TOPIC_DISPLAY: Record<string, string> = {
  LIMIT: 'LIMIT',
  DIFFERENTIAL: 'DIFFERENTIAL',
  INTEGRAL: 'INTEGRAL',
  APPLICATIONS: 'APPLICATIONS',
};

export default function QuizPage() {
  const { courseId = '' } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate  = useNavigate();

  const onFinish = () => navigate("/home");

  const {
    quizLoading, quizError,
    currentQuestion, currentIndex, totalQuestions, quizEndResult,
    selectedChoice, setSelectedChoice,
    graderStatus, graderResult, graderError,
    startQuiz, handleSubmit, handleNext, handleFinish,
  } = useQuizFlow(onFinish);

  const hasStarted = useRef(false);
  
  useEffect(() => {
    if (user?.id && courseId && !hasStarted.current) {
      hasStarted.current = true;

      const backendTopic = TOPIC_MAPPER[courseId.toLowerCase()] || courseId.toUpperCase();
      
      startQuiz(user.id, backendTopic).catch((err) => {
        console.error('Failed to start quiz:', err);
      });
    }
  }, [user?.id, courseId, startQuiz]);

  const isLastQuestion = currentIndex === totalQuestions - 1;
  const isGrading      = graderStatus === "loading";
  const hasResult      = graderStatus === "done" && graderResult !== null;
  const topicName      = TOPIC_DISPLAY[courseId] ?? courseId;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (quizLoading && !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">กำลังโหลด {topicName}…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (quizError || (!currentQuestion && !quizLoading && !quizEndResult)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center max-w-md bg-white px-20 py-10 rounded-xl shadow-md">
          <p className="text-red-600 mb-4 font-medium">{quizError ?? "ไม่พบแบบทดสอบ"}</p>
          <button
            onClick={() => user?.id && startQuiz(user.id, topic)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ลองอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  // ── Session ended ────────────────────────────────────────────────────────
  if (quizEndResult) {
    return (
      <div className="min-h-screen bg-blue-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-[#003B62] mb-6">
            สรุปผลการทำแบบทดสอบ — {topicName}
          </h2>

          {/* Score banner */}
          <div className="flex justify-center mb-8 gap-6">
            <div className="bg-blue-50 p-6 rounded-xl text-center min-w-[180px]">
              <p className="text-gray-600 font-medium">คะแนนของคุณ</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">
                {Math.round(quizEndResult.total_score)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ถูก {Math.round((quizEndResult.total_score / 100) * quizEndResult.total_questions)}{" "}
                / {quizEndResult.total_questions} ข้อ
              </p>
            </div>

            {(quizEndResult as any).student_profile ? (
              <div className="bg-indigo-50 p-6 rounded-xl text-center min-w-[180px]">
                <p className="text-gray-600 font-medium">AI Profile</p>
                <p className="text-lg font-bold text-indigo-700 mt-2">
                  {(quizEndResult as any).student_profile}
                </p>
                {(quizEndResult as any).avg_mastery != null && (
                  <>
                    <p className="text-sm text-gray-500 mt-1">
                      Mastery: {((quizEndResult as any).avg_mastery * 100).toFixed(1)}%
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
                  </>
                )}
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

          {/* Per-question summary */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">รายละเอียดแต่ละข้อ</h3>
            {quizEndResult.session_summary.map((item, idx) => {
              const isItemCorrect = item.is_correct || item.error_code === 'correct_answer';
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-l-4 ${
                    isItemCorrect ? "border-emerald-500 bg-emerald-50" : "border-rose-500 bg-rose-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-gray-700 ">ข้อที่ {item.question_number}</span>
                    {isItemCorrect
                      ? <span className="text-emerald-600 font-bold">✓ ถูกต้อง</span>
                      : <span className="text-rose-600 font-bold">✗ ผิด</span>}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p><span className="font-medium">เรื่อง:</span> {item.main_topic ?? "-"} / {item.sub_topic ?? "-"}</p>
                    {item.error_code && (
                      <div className={`mt-3 p-3 bg-white rounded border ${isItemCorrect ? 'border-emerald-200' : 'border-rose-200'}`}>
                        <p className={`${isItemCorrect ? 'text-emerald-700' : 'text-rose-700'} font-medium mb-1`}>
                          {mapErrorCodeToThai(item.error_code)}
                        </p>
                        <p className="text-gray-500 text-xs">คำตอบที่เลือก: {item.user_answer}</p>
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
            })}
          </div>

          {/* Adaptive Next Steps */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h3 className="text-lg font-bold text-center text-gray-800 mb-6">เรียนรู้ต่อในระดับที่คุณต้องการ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { emoji: '🚀', label: 'ท้าทายตัวเอง',  sub: 'ขอโจทย์ที่ยากขึ้น',  color: 'indigo' },
                { emoji: '🎯', label: 'ฝึกฝนต่อ',      sub: 'ระดับปัจจุบัน',     color: 'blue'   },
                { emoji: '📖', label: 'ทบทวนพื้นฐาน',  sub: 'ขอโจทย์ง่ายลง',    color: 'gray'   },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => user?.id && startQuiz(user.id, topic)}
                  className={`flex flex-col items-center p-4 rounded-2xl border-2 border-${btn.color}-100 bg-${btn.color}-50 hover:border-${btn.color}-300 transition-all group`}
                >
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{btn.emoji}</span>
                  <span className={`font-bold text-${btn.color}-700`}>{btn.label}</span>
                  <span className={`text-xs text-${btn.color}-500 mt-1`}>{btn.sub}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-center">
              <button onClick={handleFinish} className="px-10 py-3 text-gray-500 hover:text-gray-700 font-medium transition">
                ← กลับสู่หน้าหลัก
              </button>
            </div>
          </div>
        </div>
    );
  }

  if (!currentQuestion) return null;

  // ── Main quiz flow ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <QuestionCard
          question={currentQuestion}
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          selectedChoice={selectedChoice}
          onChoiceSelect={setSelectedChoice}
          disabled={isGrading || hasResult}
        />

        {isGrading && <GraderLoadingOverlay />}

        {graderError && !isGrading && !hasResult && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-semibold">⚠️ ไม่สามารถรับผลจาก AI Grader:</p>
            <p className="mt-1">{graderError}</p>
          </div>
        )}

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

        {!hasResult && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => user?.id && handleSubmit(user.id)}
              disabled={isGrading || !selectedChoice}
              className={[
                "px-12 py-3 rounded-full font-semibold text-lg shadow-lg transition-all duration-200 active:scale-95",
                isGrading || !selectedChoice
                  ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                  : "bg-yellow-400 text-gray-800 hover:bg-yellow-500",
              ].join(" ")}
            >
              {isGrading ? "AI กำลังวิเคราะห์…" : isLastQuestion ? "ส่งคำตอบทั้งหมด" : "ส่งคำตอบ"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
