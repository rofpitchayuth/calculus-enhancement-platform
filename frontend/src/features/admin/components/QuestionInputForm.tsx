/**
 * QuestionInputForm.tsx — Presentation Layer (Stateless Component)
 * =================================================================
 * Captures the raw question text and 5 choices (A-E) from the admin.
 */

import React from "react";
import type { QuestionDraftRequest } from "../types/admin.types";

interface QuestionInputFormProps {
  input: QuestionDraftRequest;
  setInput: (input: QuestionDraftRequest) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export function QuestionInputForm({ input, setInput, onGenerate, isLoading }: QuestionInputFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">1. Input Question Details</h2>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Question Text (LaTeX supported with $...$)</label>
        <textarea
          name="question_text"
          value={input.question_text}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          placeholder="Enter the calculus question here..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(["a", "b", "c", "d", "e"] as const).map((letter) => (
          <div key={letter} className="space-y-1">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Choice {letter.toUpperCase()}
            </label>
            <input
              type="text"
              name={`choice_${letter}`}
              value={input[`choice_${letter}`]}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={`Answer for ${letter.toUpperCase()}`}
            />
          </div>
        ))}
      </div>

      <div className="pt-4">
        <button
          onClick={onGenerate}
          disabled={isLoading || !input.question_text}
          className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
            isLoading || !input.question_text
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-md"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              AI Analyzing... (30-90s)
            </span>
          ) : (
            "✨ Auto-Analyze with AI"
          )}
        </button>
      </div>
    </div>
  );
}
