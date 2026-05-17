/**
 * QuestionInputForm.tsx — Presentation Layer (Stateless Component)
 * =================================================================
 * Captures the raw question text and 5 choices (A-E) from the admin.
 */

import React from "react";
import type { QuestionDraftRequest } from "../types/admin.types";
import MathImageUploader from "./MathImageUploader";

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

  const handleMathChange = (latex: string) => {
    setInput({ ...input, question_text: latex });
  };

  const handleExtractedData = (data: { latex: string; choices: string[] }) => {
    setInput({
      ...input,
      question_text: data.latex,
      choice_a: data.choices[0] || "",
      choice_b: data.choices[1] || "",
      choice_c: data.choices[2] || "",
      choice_d: data.choices[3] || "",
      choice_e: data.choices[4] || "",
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-inner">
          <MathImageUploader 
            onLatexChange={handleMathChange}
            onExtractedData={handleExtractedData}
            initialValue={input.question_text}
            label="Question Text (Auto-OCR or Visual Editor)"
          />
          
          <div className="mt-6 space-y-3">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Raw Source / LaTeX Editor
            </label>
            <textarea
              name="question_text"
              value={input.question_text}
              onChange={handleChange}
              rows={4}
              className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-sm font-mono bg-white shadow-sm"
              placeholder="LaTeX formula will appear here..."
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(["a", "b", "c", "d", "e"] as const).map((letter) => (
          <div key={letter} className="relative group">
            <label className="absolute -top-2 left-4 px-2 bg-white text-[10px] font-black text-blue-500 uppercase tracking-widest z-10">
              Choice {letter.toUpperCase()}
            </label>
            <input
              type="text"
              name={`choice_${letter}`}
              value={input[`choice_${letter}`]}
              onChange={handleChange}
              className="w-full px-6 py-4 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all bg-white group-hover:border-slate-200"
              placeholder={`Enter answer ${letter.toUpperCase()}`}
            />
          </div>
        ))}
      </div>

      <div className="pt-6">
        <button
          onClick={onGenerate}
          disabled={isLoading || !input.question_text}
          className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-[0.2em] transition-all relative overflow-hidden group ${
            isLoading || !input.question_text
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-[#003B62] text-white hover:bg-[#002b4a] shadow-xl shadow-blue-100 hover:shadow-blue-200 active:scale-[0.98]"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full" />
              AI is Analyzing Taxonomy...
            </span>
          ) : (
            <>
              <span className="relative z-10 flex items-center justify-center gap-2">
                ✨ Generate AI Draft Analysis
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
