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
  try {
    // Convert common math symbols to LaTeX
    let latex = text
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
      // Handle superscripts: x^2 → x^{2}
      .replace(/\^(\d+)/g, '^{$1}')
      .replace(/\^(\w+)/g, '^{$1}');
    
    // Check if text has math symbols
    const hasMath = /[∫→≤≥×÷±≠∞π√^_\\]|\(|\)|=/.test(text);
    
    if (hasMath) {
      return <InlineMath math={latex} />;
    }
    
    return <span>{text}</span>;
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
              className={`w-3 h-3 rounded-full transition-all ${
                i < currentIndex 
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

        {question.choices && question.choices.length === 4 ? (
          <div className="space-y-4">
            {question.choices.map((choice, index) => {
              const isSelected = selectedChoice === choice;
              
              return (
                <label
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    checked={isSelected}
                    onChange={() => onChoiceSelect(choice)}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-lg ${isSelected ? 'font-semibold text-blue-900' : 'text-gray-700'}`}>
                    {renderMathText(choice)}
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
