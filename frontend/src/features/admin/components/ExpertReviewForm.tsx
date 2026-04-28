/**
 * ExpertReviewForm.tsx — Presentation Layer (Stateless Component)
 * ==================================================================
 * Allows the domain expert to review and edit the AI-generated draft
 * (taxonomy, error codes, and step-by-step analysis).
 */

import React from "react";
import { renderMathText } from "../../exam/components/mathRenderer";
import type { QuestionAnalysis, QuestionDraftRequest } from "../types/admin.types";

interface ExpertReviewFormProps {
  draftInput: QuestionDraftRequest;
  analysis: QuestionAnalysis;
  setAnalysis: (analysis: QuestionAnalysis) => void;
  onSave: (correctChoice: string) => void;
  isSaving: boolean;
}

export function ExpertReviewForm({ draftInput, analysis, setAnalysis, onSave, isSaving }: ExpertReviewFormProps) {
  const [correctChoice, setCorrectChoice] = React.useState("A");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAnalysis({ ...analysis, [name]: value });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800">2. Expert Review & Finalization</h2>
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">AI Draft Ready</span>
      </div>

      {/* --- LaTeX Preview Section --- */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Live Math Preview</h3>
        <div className="prose prose-slate max-w-none">
          <div className="text-lg font-medium text-slate-800">
            {renderMathText(draftInput.question_text)}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {(["a", "b", "c", "d", "e"] as const).map(l => (
              <div key={l} className="text-sm">
                <span className="font-bold text-blue-600 mr-2">{l.toUpperCase()})</span>
                {renderMathText(draftInput[`choice_${l}`])}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Taxonomy Settings --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-500 uppercase">Main Topic</label>
          <input
            type="text"
            name="main_topic"
            value={analysis.main_topic}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-500 uppercase">Sub Topic</label>
          <input
            type="text"
            name="sub_topic"
            value={analysis.sub_topic}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-500 uppercase">Bloom's Level</label>
          <select
            name="bloom_level"
            value={analysis.bloom_level}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg bg-white"
          >
            {["Remembering", "Understanding", "Applying", "Analyzing", "Evaluating", "Creating"].map(lvl => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-500 uppercase">Correct Answer</label>
          <select
            value={correctChoice}
            onChange={(e) => setCorrectChoice(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-white font-bold text-blue-600"
          >
            {["A", "B", "C", "D", "E"].map(l => (
              <option key={l} value={l}>Choice {l}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-500 uppercase">Difficulty (0.0 - 1.0)</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              step="0.05"
              min="0"
              max="1"
              name="difficulty"
              value={analysis.difficulty}
              onChange={handleChange}
              className="flex-1"
            />
            <input
              type="number"
              step="0.01"
              name="difficulty"
              value={analysis.difficulty}
              onChange={handleChange}
              className="w-20 px-2 py-1 border rounded text-center font-bold"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-500 uppercase">Discrimination (0.0 - 1.0)</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              step="0.05"
              min="0"
              max="1"
              name="discrimination"
              value={analysis.discrimination}
              onChange={handleChange}
              className="flex-1"
            />
            <input
              type="number"
              step="0.01"
              name="discrimination"
              value={analysis.discrimination}
              onChange={handleChange}
              className="w-20 px-2 py-1 border rounded text-center font-bold"
            />
          </div>
        </div>
      </div>

      {/* --- Error Mapping --- */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Error Code Assignment</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {(["A", "B", "C", "D", "E"] as const).map(l => (
            <div key={l} className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-500 uppercase">Code {l}</label>
              <input
                type="text"
                name={`error_code_${l}`}
                value={(analysis as any)[`error_code_${l}`]}
                onChange={handleChange}
                className={`w-full px-2 py-1 text-xs border rounded ${l === correctChoice ? "bg-green-50 border-green-200 text-green-700" : ""}`}
                disabled={l === correctChoice}
              />
            </div>
          ))}
        </div>
      </div>

      {/* --- Detailed Reasoning --- */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Step-by-Step Analysis (Thai + LaTeX)</label>
        <textarea
          name="step_by_step_analysis"
          value={analysis.step_by_step_analysis}
          onChange={handleChange}
          rows={6}
          className="w-full px-4 py-2 border rounded-lg font-mono text-sm bg-slate-50"
        />
        <div className="mt-2 p-4 bg-slate-100 rounded border border-dashed border-slate-300">
           <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Live Analysis Preview</p>
           <div className="text-sm leading-relaxed whitespace-pre-wrap">
             {renderMathText(analysis.step_by_step_analysis)}
           </div>
        </div>
      </div>

      <div className="pt-6 border-t">
        <button
          onClick={() => onSave(correctChoice)}
          disabled={isSaving}
          className={`w-full py-4 rounded-xl font-black text-lg uppercase tracking-widest transition-all ${
            isSaving
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200"
          }`}
        >
          {isSaving ? "Saving to Database..." : "🚀 Confirm & Save Question"}
        </button>
      </div>
    </div>
  );
}
