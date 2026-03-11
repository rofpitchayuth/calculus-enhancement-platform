import { useState, useEffect, useRef } from 'react';
import { useQuiz } from '../hooks/useQuiz';
import { QuestionCard } from '../components/QuestionCard';
import { useAuth } from '../../auth/hooks/useAuth';
import type { QuizEndResponse } from '../types/quiz.types';
import { useNavigate } from 'react-router-dom';

export default function QuizPage() {
  const { user } = useAuth();
  const { quiz, currentIndex, loading, error, startQuiz, submitAnswer, nextQuestion, endQuizSession, resetQuiz } = useQuiz();
  const [selectedChoice, setSelectedChoice] = useState('');
  const [quizEndResult, setQuizEndResult] = useState<QuizEndResponse | null>(null);
  const navigate = useNavigate();
  const hasStarted = useRef(false); // guard against double-invoke in React 18 Strict Mode

  useEffect(() => {
    if (user?.id && !hasStarted.current) {
      hasStarted.current = true;
      startQuiz(user.id, 5);
    }
  }, [user?.id]);

  const handleSubmit = async () => {
    if (!quiz || !selectedChoice || !user?.id) {
      alert('กรุณาเลือกคำตอบ');
      return;
    }

    const currentQuestion = quiz.questions[currentIndex];

    // Submit the answer but don't show immediate feedback
    await submitAnswer(
      user.id,
      currentQuestion.id,
      selectedChoice,
      currentQuestion.skill_id
    );

    const hasNext = nextQuestion();
    setSelectedChoice('');

    if (!hasNext) {
      // It was the last question, end the session and show summary
      const endResult = await endQuizSession(user.id);
      if (endResult) {
        setQuizEndResult(endResult);
      }
    }
  };

  const handlePrevious = () => {
    alert('ฟีเจอร์ย้อนกลับกำลังพัฒนา');
  };

  const handleFinish = () => {
    navigate('/home');
    resetQuiz();
  };

  if (loading && !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดแบบทดสอบ...</p>
        </div>
      </div>
    );
  }

  if (error || (!quiz && !loading && !quizEndResult)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'ไม่พบแบบทดสอบ'}</p>
          <button
            onClick={() => user?.id && startQuiz(user.id, 5)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ลองอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  // ----- Render Summary Screen -----
  if (quizEndResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-[#003B62] mb-6">สรุปผลการทำแบบทดสอบ</h2>

          <div className="flex justify-center mb-8">
            <div className="bg-blue-50 p-6 rounded-xl text-center min-w-[200px]">
              <p className="text-gray-600 font-medium">คะแนนของคุณ</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">
                {Math.round(quizEndResult.total_score)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ตอบถูก {Math.round((quizEndResult.total_score / 100) * quizEndResult.total_questions)} / {quizEndResult.total_questions} ข้อ
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">รายละเอียดข้อที่ทำ</h3>
            {quizEndResult.session_summary.map((item, idx) => (
              <div key={idx} className={`p-4 rounded-lg border-l-4 ${item.is_correct ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-gray-700">ข้อที่ {item.question_number}</span>
                  {item.is_correct ? (
                    <span className="text-green-600 font-bold flex items-center gap-1">✓ ถูกต้อง</span>
                  ) : (
                    <span className="text-red-600 font-bold flex items-center gap-1">✗ ผิด</span>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p><span className="font-medium">เรื่อง:</span> {item.main_topic || '-'} / {item.sub_topic || '-'}</p>
                  {!item.is_correct && (
                    <div className="mt-2 p-3 bg-white rounded border border-red-200">
                      <p className="text-red-600"><span className="font-medium">คำตอบที่คุณเลือก:</span> {item.user_answer}</p>
                      <p className="text-gray-700 mt-1"><span className="font-medium">ข้อผิดพลาดที่พบ (Error Code):</span> {item.error_code || 'ยังระบุไม่ได้'}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <button
              onClick={handleFinish}
              className="px-10 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition"
            >
              กลับสู่หน้าหลัก
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = quiz?.questions?.[currentIndex];
  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <QuestionCard
          question={currentQuestion}
          currentIndex={currentIndex}
          totalQuestions={quiz.total_questions}
          selectedChoice={selectedChoice}
          onChoiceSelect={setSelectedChoice}
        />

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-8 py-3 bg-blue-900 text-white rounded-full font-semibold text-lg hover:bg-blue-950 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-lg"
          >
            ย้อนกลับ
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedChoice}
            className="px-12 py-3 bg-yellow-400 text-gray-800 rounded-full font-semibold text-lg hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-lg"
          >
            {loading ? 'กำลังส่ง...' : (currentIndex === quiz.total_questions - 1 ? 'ส่งคำตอบทั้งหมด' : 'ข้อถัดไป')}
          </button>
        </div>
      </div>
    </div>
  );
}
