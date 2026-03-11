import type { Question } from '../types/quiz.types';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedChoice: string;
  onChoiceSelect: (choice: string) => void;
}

const renderMathText = (text: string) => {
  if (!text) return null;

  try {
    // Split the text to separate Thai characters/spaces from math equations
    const parts = text.split(/([\u0E00-\u0E7F\s]+)/);

    return parts.map((part, index) => {
      if (!part) return null;

      // If it's pure Thai text and whitespace, render as text
      if (/^[\u0E00-\u0E7F\s]+$/.test(part)) {
        return <span key={index} className="whitespace-pre-wrap">{part}</span>;
      }

      let latex = part
        .replace(/∫/g, '\\int ')
        .replace(/→/g, '\\to ')
        .replace(/≤/g, '\\leq ')
        .replace(/≥/g, '\\geq ')
        .replace(/×/g, '\\times ')
        .replace(/÷/g, '\\div ')
        .replace(/±/g, '\\pm ')
        .replace(/≠/g, '\\neq ')
        .replace(/∞/g, '\\infty ')
        .replace(/π/g, '\\pi ')
        .replace(/√/g, '\\sqrt ')
        .replace(/\^(\d+)/g, '^{$1}')
        .replace(/\^(\w+)/g, '^{$1}');

      // Render as math. Using renderError to gracefully fallback if KaTeX parsing fails
      return (
        <span key={index} className="mx-1">
          <InlineMath
            math={latex}
            renderError={() => <span>{part}</span>}
          />
        </span>
      );
    });
  } catch (error) {
    return <span>{text}</span>;
  }
};

export const QuestionCard = ({
  question,
  currentIndex,
  totalQuestions,
  selectedChoice,
  onChoiceSelect
}: QuestionCardProps) => {
  const dots = Array.from({ length: totalQuestions }, (_, i) => i);

  console.log('Question data:', question);
  console.log('Choices:', question.choices);

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800 tracking-wide">
            DIFFERENTIAL
          </h1>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          {dots.map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${i < currentIndex
                ? 'bg-green-500'
                : i === currentIndex
                  ? 'bg-blue-600'
                  : 'bg-gray-300'
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
          <div className="space-y-4">
            {question.choices.map((choice, index) => {
              const isSelected = selectedChoice === choice.id;

              return (
                <label
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    checked={isSelected}
                    onChange={() => onChoiceSelect(choice.id)}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-lg ${isSelected ? 'font-semibold text-blue-900' : 'text-gray-700'}`}>
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
