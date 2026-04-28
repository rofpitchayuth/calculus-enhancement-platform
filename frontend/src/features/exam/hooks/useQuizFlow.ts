/**
 * useQuizFlow.ts — Presentation Layer (Orchestrator Hook)
 * =========================================================
 * The single source of truth for the entire per-question quiz lifecycle.
 *
 * This hook composes:
 *   - useQuiz      → start/submit/end quiz session (existing KT flow)
 *   - useLatencyTimer → measures response time per question
 *   - graderService   → calls the LLM grader pipeline
 *
 * It exposes a clean, minimal interface to QuizPage so the page component
 * stays a pure orchestrator with zero business logic of its own.
 *
 * State machine per question:
 *   IDLE → (student selects choice) → IDLE
 *       → (student submits)         → GRADING (grader in-flight)
 *       → (grader responds)         → FEEDBACK_VISIBLE
 *       → (student clicks "Next")   → IDLE (next question) | SESSION_ENDED
 */

import { useState, useCallback } from "react";
import { useQuiz } from "./useQuiz";
import { useLatencyTimer } from "./useLatencyTimer";
import type { GraderResponse, GraderStatus } from "../types/grader.types";
import type { Question, QuizEndResponse } from "../types/quiz.types";

// ---------------------------------------------------------------------------
// Return type (explicit interface keeps QuizPage decoupled from implementation)
// ---------------------------------------------------------------------------

export interface UseQuizFlowReturn {
  // ── Quiz session state ──────────────────────────────────────────────────
  /** True while the quiz session is loading or submitting. */
  quizLoading: boolean;
  /** Error message from the quiz session layer; null when healthy. */
  quizError: string | null;
  /** The current question object, or null if the session hasn't started yet. */
  currentQuestion: Question | null;
  /** 0-based index of the current question within the session. */
  currentIndex: number;
  /** Total number of questions in the session. */
  totalQuestions: number;
  /** Final summary object populated after the last question is answered. */
  quizEndResult: QuizEndResponse | null;

  // ── Per-question choice selection ───────────────────────────────────────
  /** The choice ID (e.g. "A", "B") selected by the student, or "" if none. */
  selectedChoice: string;
  /** Update the selected choice. Disabled once submission is in-flight. */
  setSelectedChoice: (choice: string) => void;

  // ── Unified Feedback state ──────────────────────────────────────────────
  /** Tri-state: "idle" | "loading" | "done" */
  graderStatus: GraderStatus;
  /** The feedback data received from the backend. */
  graderResult: GraderResponse | null;
  /** Generic error message for submission failures. */
  graderError: string | null;

  // ── Actions ──────────────────────────────────────────────────────────────
  /** Start a new quiz session for the given user. */
  startQuiz: (userId: number, numQuestions?: number) => Promise<void>;
  /**
   * Submit the current answer. This now uses the pre-computed architecture:
   *   1. Stops the latency timer.
   *   2. Calls POST /api/v1/quiz/submit which returns deterministic grading.
   */
  handleSubmit: (userId: number) => Promise<void>;
  /** Advance to the next question. */
  handleNext: (userId: number) => Promise<void>;
  /** Navigate back to the home page. */
  handleFinish: () => void;
}

// ---------------------------------------------------------------------------
// Hook implementation
// ---------------------------------------------------------------------------

export function useQuizFlow(onFinish: () => void): UseQuizFlowReturn {
  const {
    quiz,
    currentIndex,
    loading: quizLoading,
    error: quizError,
    startQuiz: startQuizSession,
    submitAnswer,
    nextQuestion,
    endQuizSession,
    resetQuiz,
  } = useQuiz();

  const { stopAndGet: stopTimer, reset: resetTimer } = useLatencyTimer();

  const [graderStatus, setGraderStatus] = useState<GraderStatus>("idle");
  const [graderResult, setGraderResult] = useState<GraderResponse | null>(null);
  const [graderError, setGraderError] = useState<string | null>(null);

  const [selectedChoice, setSelectedChoiceState] = useState<string>("");
  const [quizEndResult, setQuizEndResult] = useState<QuizEndResponse | null>(null);

  const currentQuestion = quiz?.questions[currentIndex] ?? null;
  const totalQuestions = quiz?.total_questions ?? 0;

  const setSelectedChoice = useCallback(
    (choice: string) => {
      if (graderStatus === "loading" || graderStatus === "done") return;
      setSelectedChoiceState(choice);
    },
    [graderStatus]
  );

  const startQuiz = useCallback(
    async (userId: number, numQuestions = 5) => {
      setSelectedChoiceState("");
      setGraderStatus("idle");
      setGraderResult(null);
      setGraderError(null);
      setQuizEndResult(null);
      await startQuizSession(userId, numQuestions);
    },
    [startQuizSession]
  );

  const handleSubmit = useCallback(
    async (userId: number) => {
      if (!quiz || !currentQuestion || !selectedChoice) return;
      if (graderStatus !== "idle") return;

      const latency = stopTimer();
      setGraderStatus("loading");
      setGraderError(null);

      try {
        // CALL UNIFIED SUBMISSION (PRE-COMPUTED)
        const result = await submitAnswer(
          userId,
          currentQuestion.id,
          selectedChoice,
          currentQuestion.skill_id,
          latency
        );

        if (result) {
          // Adapt the result to the GraderResponse shape used by UI
          setGraderResult({
            student_id: userId,
            question_id: currentQuestion.id,
            selected_choice: selectedChoice,
            is_correct: result.is_correct,
            error_code: result.error_code,
            feedback_text: result.feedback_text
          });
          setGraderStatus("done");
        } else {
          throw new Error("ไม่สามารถส่งคำตอบได้ กรุณาลองใหม่อีกครั้ง");
        }
      } catch (err: unknown) {
        setGraderError("ไม่สามารถส่งคำตอบได้ กรุณาลองใหม่อีกครั้ง");
        setGraderStatus("idle");
      }
    },
    [quiz, currentQuestion, selectedChoice, graderStatus, stopTimer, submitAnswer]
  );

  // ---------------------------------------------------------------------------
  // handleNext
  // ---------------------------------------------------------------------------

  const handleNext = useCallback(
    async (userId: number) => {
      if (!quiz) return;

      const hasNext = nextQuestion();

      if (hasNext) {
        // Move to the next question: reset all per-question state.
        setSelectedChoiceState("");
        setGraderStatus("idle");
        setGraderResult(null);
        setGraderError(null);
        resetTimer(); // Restart latency clock for the new question.
      } else {
        // Last question answered — end the session and get the KT profile.
        const endResult = await endQuizSession(userId);
        if (endResult) setQuizEndResult(endResult);
      }
    },
    [quiz, nextQuestion, endQuizSession, resetTimer]
  );

  // ---------------------------------------------------------------------------
  // handleFinish
  // ---------------------------------------------------------------------------

  const handleFinish = useCallback(() => {
    resetQuiz();
    onFinish();
  }, [resetQuiz, onFinish]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    quizLoading,
    quizError,
    currentQuestion,
    currentIndex,
    totalQuestions,
    quizEndResult,
    selectedChoice,
    setSelectedChoice,
    graderStatus,
    graderResult,
    graderError,
    startQuiz,
    handleSubmit,
    handleNext,
    handleFinish,
  };
}
