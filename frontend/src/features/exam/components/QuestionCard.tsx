/**
 * QuestionCard.tsx — Presentational Component
 * ============================================
 * Renders the current calculus question and its 5 answer choices.
 *
 * Responsibilities:
 *   - Display the question text with LaTeX via renderMathText.
 *   - Display each choice with LaTeX via renderMathText.
 *   - Highlight the selected choice.
 *   - Disable all choices when disabled=true (grader is in-flight or done).
 *
 * This component is intentionally stateless.  All state lives in useQuizFlow.
 */

import type { Question } from "../types/quiz.types";
import { renderMathText } from "./mathRenderer";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedChoice: string;
  onChoiceSelect: (choice: string) => void;
  /** When true the choice radio buttons are inert (grader in-flight or done). */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const QuestionCard = ({
  question,
  currentIndex,
  totalQuestions,
  selectedChoice,
  onChoiceSelect,
  disabled = false,
}: QuestionCardProps) => {
  const dots = Array.from({ length: totalQuestions }, (_, i) => i);

  return (
    <>
      {/* ── Header: progress dots ────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800 tracking-wide">
            CALCULUS QUIZ
          </h1>
          <span className="text-sm text-gray-500 font-medium">
            ข้อที่ {currentIndex + 1} / {totalQuestions}
          </span>
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

      {/* ── Question body ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border-4 border-blue-500 p-8 shadow-lg">
        <div className="mb-8">
          <p className="text-xl text-gray-800 leading-relaxed mb-6">
            {renderMathText(question.question_text)}
          </p>
          <hr className="border-gray-300" />
        </div>

        {/* ── Choices ────────────────────────────────────────────────── */}
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
                  {/* Choice letter badge */}
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
