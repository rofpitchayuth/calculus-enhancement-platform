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
    <div className="space-y-12">
      {/* --- Live Math Preview Section --- */}
      <div className="bg-[#003B62] rounded-[2rem] p-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <span className="text-8xl font-black text-white">∑</span>
        </div>
        <h3 className="text-xs font-black text-blue-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
          <span className="w-4 h-px bg-blue-400"></span> Live Math Visualization
        </h3>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <div className="text-2xl font-bold text-white leading-relaxed mb-10">
            {renderMathText(draftInput.question_text)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(["a", "b", "c", "d", "e"] as const).map(l => (
              <div key={l} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                l.toUpperCase() === correctChoice 
                ? "bg-emerald-500/20 border-emerald-400/50" 
                : "bg-white/5 border-white/10"
              }`}>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                  l.toUpperCase() === correctChoice 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/40" 
                  : "bg-white/10 text-blue-200"
                }`}>
                  {l.toUpperCase()}
                </span>
                <div className="text-blue-50 font-medium">
                  {renderMathText(draftInput[`choice_${l}`])}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Taxonomy & Settings Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Main Topic", name: "main_topic", value: analysis.main_topic, type: "text" },
          { label: "Sub Topic", name: "sub_topic", value: analysis.sub_topic, type: "text" },
          { label: "Bloom's Level", name: "bloom_level", value: analysis.bloom_level, type: "select", options: ["Remembering", "Understanding", "Applying", "Analyzing", "Evaluating", "Creating"] },
          { label: "Correct Answer", name: "correct_choice", value: correctChoice, type: "select", options: ["A", "B", "C", "D", "E"] },
        ].map(field => (
          <div key={field.name} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{field.label}</label>
            {field.type === "select" ? (
              <select
                name={field.name}
                value={field.value}
                onChange={(e) => field.name === "correct_choice" ? setCorrectChoice(e.target.value) : handleChange(e)}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none font-bold text-slate-700"
              >
                {field.options?.map(opt => <option key={opt} value={opt}>{field.name === "correct_choice" ? `Choice ${opt}` : opt}</option>)}
              </select>
            ) : (
              <input
                type="text"
                name={field.name}
                value={field.value}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none font-bold text-slate-700"
              />
            )}
          </div>
        ))}
      </div>

      {/* --- Difficulty & Discrimination Sliders --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { label: "Item Difficulty (IRT b)", name: "difficulty", value: analysis.difficulty, color: "blue" },
          { label: "Discrimination (IRT a)", name: "discrimination", value: analysis.discrimination, color: "emerald" },
        ].map(slider => (
          <div key={slider.name} className="bg-white rounded-2xl p-6 border-2 border-slate-50 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{slider.label}</label>
              <span className={`px-3 py-1 rounded-lg bg-${slider.color}-50 text-${slider.color}-600 font-black text-sm border border-${slider.color}-100`}>
                {Number(slider.value).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <input
                type="range"
                step="0.01"
                min="0"
                max="1"
                name={slider.name}
                value={slider.value}
                onChange={handleChange}
                className="flex-1 h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        ))}
      </div>

      {/* --- Error Mapping --- */}
      <div className="space-y-4 bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">AI Distractor Error Assignment</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {(["A", "B", "C", "D", "E"] as const).map(l => (
            <div key={l} className={`relative group transition-all ${l === correctChoice ? "opacity-50" : ""}`}>
              <label className="absolute -top-2 left-3 px-2 bg-white text-[9px] font-black text-slate-400 uppercase tracking-tighter rounded-full border border-slate-100 z-10">
                Code {l}
              </label>
              <input
                type="text"
                name={`error_code_${l}`}
                value={(analysis as any)[`error_code_${l}`]}
                onChange={handleChange}
                disabled={l === correctChoice}
                className={`w-full px-4 py-3 text-xs border-2 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition-all font-mono ${
                  l === correctChoice ? "bg-slate-100 border-slate-200" : "bg-white border-white hover:border-slate-200"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* --- Detailed Reasoning --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Step-by-Step Analysis (Thai + LaTeX)</label>
          <textarea
            name="step_by_step_analysis"
            value={analysis.step_by_step_analysis}
            onChange={handleChange}
            rows={10}
            className="w-full px-6 py-5 border-2 border-slate-100 rounded-[1.5rem] font-mono text-sm bg-white focus:ring-8 focus:ring-blue-50 focus:border-blue-200 outline-none transition-all shadow-inner"
          />
        </div>
        <div className="bg-slate-800 rounded-[1.5rem] p-8 text-slate-100 shadow-xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-yellow-500"></div>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Real-time Formatted Visualization</p>
           <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
             {renderMathText(analysis.step_by_step_analysis)}
           </div>
        </div>
      </div>

      <div className="pt-10">
        <button
          onClick={() => onSave(correctChoice)}
          disabled={isSaving}
          className={`w-full py-6 rounded-[1.5rem] font-black text-xl uppercase tracking-[0.3em] transition-all relative overflow-hidden group ${
            isSaving
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-2xl shadow-emerald-200 hover:shadow-emerald-300 active:scale-[0.98]"
          }`}
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-4">
              <span className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full" />
              Finalizing Database Commit...
            </span>
          ) : (
            <>
              <span className="relative z-10">🚀 Deploy Question to Production</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
