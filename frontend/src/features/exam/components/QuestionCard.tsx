import type { Question } from "../types/quiz.types";
import { renderMathText } from "./mathRenderer";
import { QuizTimer } from "./QuizTimer";

// Props
interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedChoice: string;
  onChoiceSelect: (choice: string) => void;
  onTimeUp?: () => void;
  disabled?: boolean;
}

// Component
export const QuestionCard = ({
  question,
  currentIndex,
  totalQuestions,
  selectedChoice,
  onChoiceSelect,
  onTimeUp = () => {},
  disabled = false,
}: QuestionCardProps) => {
  const dots = Array.from({ length: totalQuestions }, (_, i) => i);

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800 tracking-wide">
            CALCULUS QUIZ
          </h1>
          <QuizTimer
            totalSeconds={60 * 60}
            currentIndex={currentIndex}
            totalQuestions={totalQuestions}
            onTimeUp={onTimeUp}
          />
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          {dots.map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i < currentIndex
                  ? "bg-emerald-500"
                  : i === currentIndex
                  ? "bg-blue-600 scale-125"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border-4 border-blue-500 p-8 shadow-lg">
        <div className="mb-8">
          <p className="text-xl text-gray-800 leading-relaxed mb-6">
            {renderMathText(question.question_text)}
          </p>
          <hr className="border-gray-300" />
        </div>

        {question.choices && question.choices.length > 0 ? (
          <div className="space-y-3">
            {question.choices.map((choice, index) => {
              const isSelected = selectedChoice === choice.id;

              return (
                <label
                  key={index}
                  className={[
                    "flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200",
                    disabled
                      ? "cursor-not-allowed opacity-70"
                      : "cursor-pointer",
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : disabled
                      ? "border-gray-200 bg-gray-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name="answer"
                    checked={isSelected}
                    onChange={() => !disabled && onChoiceSelect(choice.id)}
                    disabled={disabled}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <span
                    className={[
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600",
                    ].join(" ")}
                  >
                    {choice.id}
                  </span>
                  <span
                    className={`text-base leading-relaxed ${
                      isSelected ? "font-semibold text-blue-900" : "text-gray-700"
                    }`}
                  >
                    {renderMathText(choice.text)}
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">กรุณาเพิ่มข้อมูล choices ในฐานข้อมูล</p>
          </div>
        )}
      </div>
    </>
  );
};
