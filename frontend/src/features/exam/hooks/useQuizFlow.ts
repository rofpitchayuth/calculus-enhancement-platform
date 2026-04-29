// src/features/exam/hooks/useQuizFlow.ts

import { useState, useCallback } from "react";
import { useQuiz } from "./useQuiz";
import { useLatencyTimer } from "./useLatencyTimer";
import type { GraderResponse, GraderStatus } from "../types/grader.types";
import type { Question, QuizEndResponse } from "../types/quiz.types";

export interface UseQuizFlowReturn {
  quizLoading:      boolean;
  quizError:        string | null;
  currentQuestion:  Question | null;
  currentIndex:     number;
  totalQuestions:   number;
  quizEndResult:    QuizEndResponse | null;
  selectedChoice:   string;
  setSelectedChoice:(choice: string) => void;
  graderStatus:     GraderStatus;
  graderResult:     GraderResponse | null;
  graderError:      string | null;
  // topic: string เพิ่มเข้ามาใน startQuiz
  startQuiz:        (userId: number, topic: string, numQuestions?: number) => Promise<void>;
  handleSubmit:     (userId: number) => Promise<void>;
  handleNext:       (userId: number) => Promise<void>;
  handleFinish:     () => void;
}

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
  const [graderError, setGraderError]   = useState<string | null>(null);
  const [selectedChoice, setSelectedChoiceState] = useState<string>("");
  const [quizEndResult, setQuizEndResult] = useState<QuizEndResponse | null>(null);

  const currentQuestion = quiz?.questions[currentIndex] ?? null;
  const totalQuestions  = quiz?.total_questions ?? 0;

  const setSelectedChoice = useCallback(
    (choice: string) => {
      if (graderStatus === "loading" || graderStatus === "done") return;
      setSelectedChoiceState(choice);
    },
    [graderStatus]
  );

  // รับ topic เป็น string แทน numQuestions ที่เป็น number
  const startQuiz = useCallback(
    async (userId: number, topic: string, numQuestions = 10) => {
      setSelectedChoiceState("");
      setGraderStatus("idle");
      setGraderResult(null);
      setGraderError(null);
      setQuizEndResult(null);
      await startQuizSession(userId, topic, numQuestions);
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
        const result = await submitAnswer(
          userId,
          currentQuestion.id,
          selectedChoice,
          currentQuestion.skill_id,
          latency
        );

        if (result) {
          setGraderResult({
            student_id:      userId,
            question_id:     currentQuestion.id,
            selected_choice: selectedChoice,
            is_correct:      result.is_correct,
            error_code:      result.error_code,
            feedback_text:   result.feedback_text,
          });
          setGraderStatus("done");
        } else {
          throw new Error("ไม่สามารถส่งคำตอบได้");
        }
      } catch {
        setGraderError("ไม่สามารถส่งคำตอบได้ กรุณาลองใหม่อีกครั้ง");
        setGraderStatus("idle");
      }
    },
    [quiz, currentQuestion, selectedChoice, graderStatus, stopTimer, submitAnswer]
  );

  const handleNext = useCallback(
    async (userId: number) => {
      if (!quiz) return;
      const hasNext = nextQuestion();
      if (hasNext) {
        setSelectedChoiceState("");
        setGraderStatus("idle");
        setGraderResult(null);
        setGraderError(null);
        resetTimer();
      } else {
        const endResult = await endQuizSession(userId);
        if (endResult) setQuizEndResult(endResult);
      }
    },
    [quiz, nextQuestion, endQuizSession, resetTimer]
  );

  const handleFinish = useCallback(() => {
    resetQuiz();
    onFinish();
  }, [resetQuiz, onFinish]);

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
