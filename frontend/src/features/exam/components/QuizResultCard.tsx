import type { SubmitResponse } from '../types/quiz.types';

interface QuizResultCardProps {
  result: SubmitResponse;
  onNext: () => void;
  isLastQuestion: boolean;
}

export const QuizResultCard = ({ result, onNext, isLastQuestion }: QuizResultCardProps) => {
  return (
    <div className={`p-6 rounded-xl ${result.is_correct ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${result.is_correct ? 'bg-green-500' : 'bg-red-500'}`}>
          <span className="text-white text-2xl">{result.is_correct ? '✓' : '✗'}</span>
        </div>
        <div>
          <h3 className={`text-lg font-bold ${result.is_correct ? 'text-green-700' : 'text-red-700'}`}>
            {result.is_correct ? 'Correct!' : 'Incorrect'}
          </h3>
          <p className="text-sm text-gray-600">
            Correct answer: <strong>{result.correct_answer}</strong>
          </p>
        </div>
      </div>

      {/* IBKT Results */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Mastery Before</p>
          <p className="text-2xl font-bold text-blue-600">
            {(result.p_mastery_before * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Mastery After</p>
          <p className="text-2xl font-bold text-green-600">
            {(result.p_mastery_after * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
      >
        {isLastQuestion ? 'Finish Quiz' : 'Next Question →'}
      </button>
    </div>
  );
};
