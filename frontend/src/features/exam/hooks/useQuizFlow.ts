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
  startQuiz:        (userId: number, topic: string, numQuestions?: number, difficultyLevel?: string) => Promise<void>;
  handleSubmit:     (userId: number) => Promise<void>;
  handleNext:       (userId: number) => Promise<void>;
  handleFinish:     () => void;
}

export function useQuizFlow(onFinish: () => void): UseQuizFlowReturn {
  const {
    quiz,
    currentIndex,
    setCurrentIndex,
    loading: quizLoading,
    error: quizError,
    startQuiz: startQuizSession,
    submitAnswer,
    nextQuestion,
    prevQuestion,
    endQuizSession,
    resetQuiz,
  } = useQuiz();

  const { stopAndGet: stopTimer, reset: resetTimer } = useLatencyTimer();

  const [graderStatus, setGraderStatus] = useState<GraderStatus>("idle");
  const [graderResult, setGraderResult] = useState<GraderResponse | null>(null);
  const [graderError, setGraderError]   = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [quizEndResult, setQuizEndResult] = useState<QuizEndResponse | null>(null);

  const currentQuestion = quiz?.questions[currentIndex] ?? null;
  const totalQuestions  = quiz?.total_questions ?? 0;

  // The local selection state is now derived from answers
  const selectedChoice = currentQuestion ? answers[currentQuestion.id] || "" : "";

  const setSelectedChoice = useCallback(
    (choice: string) => {
      if (graderStatus === "loading" || graderStatus === "done") return;
      if (currentQuestion) {
         setAnswers(prev => ({ ...prev, [currentQuestion.id]: choice }));
      }
    },
    [graderStatus, currentQuestion]
  );

  const startQuiz = useCallback(
    async (userId: number, topic: string, numQuestions = 10, difficultyLevel?: string) => {
      setAnswers({});
      setGraderStatus("idle");
      setGraderResult(null);
      setGraderError(null);
      setQuizEndResult(null);
      await startQuizSession(userId, topic, numQuestions, difficultyLevel);
    },
    [startQuizSession]
  );

  const handleNext = useCallback(() => {
    if (!quiz) return;
    nextQuestion();
  }, [quiz, nextQuestion]);

  const handlePrev = useCallback(() => {
    if (!quiz) return;
    prevQuestion();
  }, [quiz, prevQuestion]);

  const handleSubmitAll = useCallback(
    async (userId: number) => {
      if (!quiz) return;
      if (graderStatus !== "idle") return;

      const latency = stopTimer(); // Use total time or basic latency
      setGraderStatus("loading");
      setGraderError(null);

      try {
        // Submit all answers sequentially to maintain BKT flow properly
        for (const question of quiz.questions) {
            const userAnswer = answers[question.id] || "";
            // Even if empty, we submit something, though typically we'd force answering all
            if (userAnswer) {
                await submitAnswer(
                  userId,
                  question.id,
                  userAnswer,
                  question.skill_id,
                  latency / quiz.questions.length // approximate per-question latency
                );
            }
        }
        
        // After all submissions, end the session
        const endResult = await endQuizSession(userId);
        if (endResult) {
            setQuizEndResult(endResult);
        }
        setGraderStatus("done");
      } catch (err) {
        setGraderError("ไม่สามารถส่งคำตอบทั้งหมดได้ กรุณาลองใหม่อีกครั้ง");
        setGraderStatus("idle");
      }
    },
    [quiz, answers, graderStatus, stopTimer, submitAnswer, endQuizSession]
  );

  const handleFinish = useCallback(() => {
    resetQuiz();
    onFinish();
  }, [resetQuiz, onFinish]);

  // Keep handleSubmit for compatibility, but make it do what handleSubmitAll does
  const handleSubmit = handleSubmitAll;

  return {
    quizLoading,
    quizError,
    currentQuestion,
    currentIndex,
    totalQuestions,
    quizEndResult,
    selectedChoice,
    setSelectedChoice,
    answers,
    graderStatus,
    graderResult,
    graderError,
    startQuiz,
    handleSubmit,
    handleSubmitAll,
    handleNext,
    handlePrev,
    handleFinish,
  };
}
