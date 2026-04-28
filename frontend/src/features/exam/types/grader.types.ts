/**
 * grader.types.ts — Domain / Entity Layer
 * =========================================
 * Strict TypeScript interfaces that mirror the backend GraderRequest and
 * GraderResponse Pydantic schemas defined in:
 *   backend/app/schemas/grader.py
 *
 * These types are intentionally framework-agnostic — they contain no React,
 * no Axios, and no side-effect logic.  Every other layer imports from here.
 */

// ---------------------------------------------------------------------------
// Request
// ---------------------------------------------------------------------------

/**
 * Payload sent to POST /api/v1/grader/analyze.
 * Maps 1-to-1 with backend GraderRequest.
 */
export interface GraderRequest {
  /** Primary key of the student (must match the JWT user id). */
  student_id: number;

  /** Primary key of the question being answered. */
  question_id: number;

  /** Full question body — may contain LaTeX delimited by $…$. */
  question_text: string;

  /** Text of choice A. */
  choice_a: string;

  /** Text of choice B. */
  choice_b: string;

  /** Text of choice C. */
  choice_c: string;

  /** Text of choice D. */
  choice_d: string;

  /** Text of choice E. */
  choice_e: string;

  /** The letter the student selected (A | B | C | D | E). */
  selected_choice: string;

  /**
   * Time in seconds from question render to submission.
   * Tracked by useLatencyTimer and persisted via the quiz/submit endpoint
   * (response_time column in quiz_attempts table).
   * Not consumed by the grader itself but sent alongside for KT recording.
   */
  response_latency: number;
}

// ---------------------------------------------------------------------------
// Response
// ---------------------------------------------------------------------------

/**
 * Response from POST /api/v1/grader/analyze.
 * Maps 1-to-1 with backend GraderResponse.
 */
export interface GraderResponse {
  /** Echoed student_id for correlation. */
  student_id: number;

  /** Echoed question_id for correlation. */
  question_id: number;

  /** The normalised uppercase letter that was analysed, e.g. "B". */
  selected_choice: string;

  /**
   * True when the student's chosen option matches the correct answer.
   * Derived on the backend: error_code === "correct_answer".
   */
  is_correct: boolean;

  /**
   * The specific error taxonomy code assigned by the Gemini evaluator.
   * Examples: "correct_answer" | "sign_error" | "forgot_chain_rule_inner"
   * | "arithmetic_error" | "fraction_operation_error" …
   *
   * The full set of valid values is defined in ErrorCodeEnum in
   * ml-services/LLM_classifier/classifier/LLM_classifier.py.
   */
  error_code: string;

  /**
   * The Gemini-generated step-by-step Thai-language analysis.
   * This string may contain LaTeX delimited by $…$ — pass it through
   * the renderMathText helper before displaying.
   */
  feedback_text: string;
}

// ---------------------------------------------------------------------------
// UI-layer state shape (produced by useQuizFlow)
// ---------------------------------------------------------------------------

/**
 * The three possible UI states for the per-question grader call.
 *
 * - "idle":    No submission yet for the current question.
 * - "loading": Grader request is in-flight (show spinner / disable buttons).
 * - "done":    GraderResponse received and ready to display.
 */
export type GraderStatus = "idle" | "loading" | "done";
