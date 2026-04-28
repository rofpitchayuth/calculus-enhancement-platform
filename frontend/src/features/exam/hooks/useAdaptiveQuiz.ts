/**
 * useAdaptiveQuiz.ts — Presentation Layer (Orchestrator Hook)
 * ==========================================================
 * Manages the "Practice Mode" loop where questions are served adaptively.
 */

import { useState, useCallback, useEffect } from "react";
import { recommendationService } from "../services/recommendation.service";
import type { Question } from "../types/grader.types";

export function useAdaptiveQuiz(subTopic: string) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to load the next adaptive question
  const fetchNext = useCallback(async (difficultyAdjustment: string = "normal") => {
    setIsLoading(true);
    setError(null);
    try {
      const question = await recommendationService.getNextQuestion(subTopic, difficultyAdjustment);
      setCurrentQuestion(question);
    } catch (err: any) {
      setError(err.message || "Failed to load the next question.");
    } finally {
      setIsLoading(false);
    }
  }, [subTopic]);

  // Initial load on mount
  useEffect(() => {
    fetchNext();
  }, [fetchNext]);

  return {
    currentQuestion,
    setCurrentQuestion,
    isLoading,
    error,
    fetchNext,
  };
}
