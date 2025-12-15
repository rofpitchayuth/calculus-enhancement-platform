import { useState, useEffect } from 'react';
import { useQuiz } from '../hooks/useQuiz';
import { QuestionCard } from '../components/QuestionCard';
import { QuizResultCard } from '../components/QuizResultCard';
import { useAuth } from '../../auth/hooks/useAuth';
import type { SubmitResponse } from '../types/quiz.types';
import { useNavigate } from 'react-router-dom';

export default function QuizPage() {
  const { user } = useAuth();
  const { quiz, currentIndex, loading, error, startQuiz, submitAnswer, nextQuestion, resetQuiz } = useQuiz();
  const [selectedChoice, setSelectedChoice] = useState('');
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      startQuiz(user.id, 5);
    }
  }, [user?.id]);

  const handleSubmit = async () => {
    if (!quiz || !selectedChoice || !user?.id) {
      alert('กรุณาเลือกคำตอบ');
      return;
    }

    const currentQuestion = quiz.questions[currentIndex];
    const submitResult = await submitAnswer(
      user.id,
      currentQuestion.id,
      selectedChoice,
      currentQuestion.skill_id
    );

    if (submitResult) {
      setResult(submitResult);
    }
  };

  const handleNext = () => {
    const hasNext = nextQuestion();
    setSelectedChoice('');
    setResult(null);
    
    if (!hasNext) {
      navigate('/home');
      resetQuiz();
      if (user?.id) {
        startQuiz(user.id, 5);
      }
    }
  };

  const handlePrevious = () => {
    alert('ฟีเจอร์ย้อนกลับกำลังพัฒนา');
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

  if (error || !quiz) {
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

  const currentQuestion = quiz.questions[currentIndex];

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

        <div className="mt-8">
          {!result ? (
            <div className="flex items-center justify-center gap-4">
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
                {loading ? 'กำลังส่ง...' : 'ยืนยัน'}
              </button>
            </div>
          ) : (
            <QuizResultCard 
              result={result}
              onNext={handleNext}
              isLastQuestion={currentIndex === quiz.questions.length - 1}
            />
          )}
        </div>
      </div>
    </div>
  );
}
