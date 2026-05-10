import { useEffect, useRef, useState } from "react";
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

  const [isConfiguring, setIsConfiguring] = useState(true);
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficultyLevel, setDifficultyLevel] = useState<string | undefined>(undefined);

  const handleStartQuiz = () => {
    if (user?.id && courseId) {
      setIsConfiguring(false);
      const backendTopic = TOPIC_MAPPER[courseId.toLowerCase()] || courseId.toUpperCase();
      
      startQuiz(user.id, backendTopic, numQuestions, difficultyLevel).catch((err) => {
        console.error('Failed to start quiz:', err);
      });
    }
  };

  const formatTopicName = (id: string) => {
    if (TOPIC_DISPLAY[id]) return TOPIC_DISPLAY[id];
    if (TOPIC_DISPLAY[id.toUpperCase()]) return TOPIC_DISPLAY[id.toUpperCase()];
    return id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const isLastQuestion = currentIndex === totalQuestions - 1;
  const isGrading      = graderStatus === "loading";
  const hasResult      = graderStatus === "done" && graderResult !== null;
  const topicName      = formatTopicName(courseId);

  // ── Configuration ────────────────────────────────────────────────────────
  if (isConfiguring) {
    const configOptions = [
      { num: 5, time: 25 },
      { num: 10, time: 50 },
      { num: 15, time: 75 },
      { num: 20, time: 100 }
    ];

    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] shadow-xl p-10 max-w-2xl w-full border border-blue-100">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-sm">
              📝
            </div>
            <h2 className="text-3xl font-extrabold text-[#003B62] mb-3">
              เตรียมตัวทำแบบทดสอบ
            </h2>
            <div className="flex flex-col items-center gap-2">
              <p className="text-lg text-gray-500 font-bold bg-blue-50 inline-block px-4 py-1 rounded-full">{topicName}</p>
              {difficultyLevel && (
                <p className={`text-sm font-bold px-3 py-1 rounded-full ${
                  difficultyLevel === 'hard' ? 'bg-indigo-100 text-indigo-700' :
                  difficultyLevel === 'medium' ? 'bg-blue-100 text-blue-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  โหมด: {
                    difficultyLevel === 'hard' ? 'ท้าทายตัวเอง (ยาก)' :
                    difficultyLevel === 'medium' ? 'ฝึกฝนต่อ (ปานกลาง)' :
                    'ทบทวนพื้นฐาน (ง่าย)'
                  }
                </p>
              )}
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-gray-700 mb-6 text-center">เลือกระดับความท้าทาย (จำนวนข้อ)</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {configOptions.map(opt => (
              <button
                key={opt.num}
                onClick={() => setNumQuestions(opt.num)}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                  numQuestions === opt.num 
                    ? 'border-yellow-400 bg-yellow-50 shadow-md transform scale-[1.02]' 
                    : 'border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50'
                }`}
              >
                <span className={`text-4xl font-extrabold tracking-tight ${numQuestions === opt.num ? 'text-yellow-600' : 'text-[#003B62]'}`}>
                  {opt.num} <span className="text-xl">ข้อ</span>
                </span>
                <span className={`text-sm font-bold ${numQuestions === opt.num ? 'text-yellow-700' : 'text-gray-400'}`}>
                  เวลาแนะนำ {opt.time} นาที
                </span>
              </button>
            ))}
          </div>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/home')}
              className="px-8 py-4 bg-white text-gray-500 font-bold rounded-full hover:bg-gray-100 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleStartQuiz}
              className="bg-[#003B62] text-white px-12 py-4 rounded-full text-lg font-bold shadow-lg hover:bg-[#0a2a4a] hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95"
            >
              เริ่มทำแบบทดสอบ 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="flex flex-wrap justify-center mb-10 gap-6">
            {/* Score Card */}
            <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 p-8 rounded-[2rem] text-center min-w-[220px] shadow-sm hover:shadow-md transition-shadow">
              <p className="text-gray-500 font-bold tracking-wide uppercase text-sm mb-1">คะแนนของคุณ</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-6xl font-extrabold text-[#003B62]">
                  {Math.round(quizEndResult.total_score)}
                </span>
                <span className="text-2xl font-bold text-blue-300">%</span>
              </div>
              <p className="text-sm font-medium text-blue-600 mt-3 bg-blue-100/50 py-1 px-4 rounded-full inline-block">
                ถูก {Math.round((quizEndResult.total_score / 100) * quizEndResult.total_questions)}{" "}
                / {quizEndResult.total_questions} ข้อ
              </p>
            </div>

            {/* AI Profile Card */}
            {(quizEndResult as any).student_profile ? (
              <div className="bg-gradient-to-br from-white to-yellow-50 border border-yellow-100 p-8 rounded-[2rem] text-center min-w-[250px] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
                <p className="text-gray-500 font-bold tracking-wide uppercase text-sm mb-1">AI Profile</p>
                <p className="text-2xl font-extrabold text-yellow-600 mt-2 mb-4">
                  {(quizEndResult as any).student_profile}
                </p>
                {(quizEndResult as any).avg_mastery != null && (
                  <div className="w-full mt-auto">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Skill Mastery</span>
                      <span className="text-sm font-extrabold text-yellow-600">
                        {((quizEndResult as any).skill_mastery * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-yellow-100/50 rounded-full h-3 border border-yellow-100">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full transition-all duration-1000 shadow-sm" 
                        style={{ width: `${(quizEndResult as any).skill_mastery * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-gray-200 p-8 rounded-[2rem] text-center min-w-[250px] flex items-center justify-center">
                <p className="text-sm text-gray-400 font-medium">
                  AI Analysis temporarily unavailable
                </p>
              </div>
            )}
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
            <h3 className="text-xl font-extrabold text-center text-[#003B62] mb-8">เรียนรู้ต่อในระดับที่คุณต้องการ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {[
                { 
                  emoji: '🚀', label: 'ท้าทายตัวเอง', sub: 'ขอโจทย์ที่ยากขึ้น', difficulty: 'hard',
                  className: "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-lg hover:-translate-y-1"
                },
                { 
                  emoji: '🎯', label: 'ฝึกฝนต่อ', sub: 'ระดับปัจจุบัน', difficulty: 'medium',
                  className: "bg-blue-50 border-blue-200 text-[#003B62] hover:bg-[#003B62] hover:text-white hover:border-[#003B62] hover:shadow-lg hover:-translate-y-1"
                },
                { 
                  emoji: '📖', label: 'ทบทวนพื้นฐาน', sub: 'ขอโจทย์ง่ายลง', difficulty: 'easy',
                  className: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:shadow-lg hover:-translate-y-1"
                },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => {
                    setDifficultyLevel(btn.difficulty);
                    setIsConfiguring(true);
                  }}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 group ${btn.className}`}
                >
                  <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">{btn.emoji}</span>
                  <span className="font-bold text-lg">{btn.label}</span>
                  <span className="text-xs opacity-80 mt-1">{btn.sub}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-center mt-10">
              <button 
                onClick={handleFinish} 
                className="px-8 py-3 bg-white border border-gray-200 text-gray-600 hover:text-[#003B62] hover:border-[#003B62] hover:bg-blue-50 rounded-full font-bold transition-all duration-300 shadow-sm"
              >
                ← กลับสู่หน้าหลัก
              </button>
            </div>
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
