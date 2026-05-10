/**
 * useAdminDraft.ts — Presentation Layer (Orchestrator Hook)
 * ==========================================================
 * Manages the state and logic for the HITL Admin workflow:
 * 1. Collect initial input.
 * 2. Handle AI drafting.
 * 3. Handle expert review and editing.
 * 4. Submit to database.
 */

import { useState } from "react";
import { adminService } from "../services/admin.service";
import type { QuestionDraftRequest, QuestionAnalysis, QuestionSaveRequest } from "../types/admin.types";

export interface UseAdminDraftReturn {
  // --- Input State ---
  draftInput: QuestionDraftRequest;
  setDraftInput: (input: QuestionDraftRequest) => void;
  
  // --- Analysis State ---
  analysis: QuestionAnalysis | null;
  setAnalysis: (analysis: QuestionAnalysis | null) => void;
  
  // --- UI State ---
  isDrafting: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;

  // --- Actions ---
  handleGenerateDraft: () => Promise<void>;
  handleSaveQuestion: (correctChoice: string) => Promise<void>;
}

export function useAdminDraft(): UseAdminDraftReturn {
  const [draftInput, setDraftInput] = useState<QuestionDraftRequest>({
    question_text: "",
    choice_a: "",
    choice_b: "",
    choice_c: "",
    choice_d: "",
    choice_e: "",
  });

  const [analysis, setAnalysis] = useState<QuestionAnalysis | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGenerateDraft = async () => {
    setIsDrafting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const result = await adminService.generateDraft(draftInput);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || "Failed to generate draft.");
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSaveQuestion = async (correctChoice: string) => {
    if (!analysis) return;
    
    setIsSaving(true);
    setError(null);
    try {
      const payload: QuestionSaveRequest = {
        question_text: draftInput.question_text,
        choices: {
          A: draftInput.choice_a,
          B: draftInput.choice_b,
          C: draftInput.choice_c,
          D: draftInput.choice_d,
          E: draftInput.choice_e,
        },
        correct_answer: correctChoice,
        main_topic: analysis.main_topic,
        sub_topic: analysis.sub_topic,
        bloom_level: analysis.bloom_level,
        difficulty: analysis.difficulty,
        discrimination: analysis.discrimination,
        skill_tags: analysis.skill_tags,
        content_json: {
          step_by_step_analysis: analysis.step_by_step_analysis,
          error_mapping: {
            A: analysis.error_code_A,
            B: analysis.error_code_B,
            C: analysis.error_code_C,
            D: analysis.error_code_D,
            E: analysis.error_code_E,
          },
        },
      };

      await adminService.saveQuestion(payload);
      setSuccessMessage("Question saved successfully!");
      // Optionally reset form
      setAnalysis(null);
    } catch (err: any) {
      setError(err.message || "Failed to save question.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    draftInput,
    setDraftInput,
    analysis,
    setAnalysis,
    isDrafting,
    isSaving,
    error,
    successMessage,
    handleGenerateDraft,
    handleSaveQuestion,
  };
}
