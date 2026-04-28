/**
 * admin.types.ts — Domain Layer (Entities)
 * ==========================================
 * Strict TypeScript interfaces for the HITL Admin workflow.
 */

export interface QuestionDraftRequest {
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  choice_e: string;
}

export interface QuestionAnalysis {
  step_by_step_analysis: string;
  main_topic: string;
  sub_topic: string;
  skill_tags: string[];
  bloom_level: string;
  difficulty: number;
  discrimination: number;
  error_code_A: string;
  error_code_B: string;
  error_code_C: string;
  error_code_D: string;
  error_code_E: string;
}

export interface QuestionSaveRequest {
  question_text: string;
  choices: Record<string, string>; // { "A": "...", "B": "...", ... }
  correct_answer: string; // "A", "B", ...
  main_topic: string;
  sub_topic: string;
  bloom_level: string;
  difficulty: number;
  discrimination: number;
  skill_tags: string[];
  content_json: {
    step_by_step_analysis: string;
    error_mapping: Record<string, string>;
  };
}
