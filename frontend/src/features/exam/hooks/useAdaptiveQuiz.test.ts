/**
 * useAdaptiveQuiz.test.ts — Hook Tests
 * ======================================
 * Tests the useAdaptiveQuiz hook's state transitions:
 *   1. Initial mount triggers fetchNext("normal") automatically
 *   2. fetchNext accepts a difficulty_adjustment parameter
 *   3. Loading/error/success states transition correctly
 *   4. Error handling sets the error state
 *
 * Uses vitest + @testing-library/react's renderHook utility.
 * The recommendationService is fully mocked via vi.mock.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAdaptiveQuiz } from "./useAdaptiveQuiz";

// ---------------------------------------------------------------------------
// Mock the recommendation service
// ---------------------------------------------------------------------------

const mockGetNextQuestion = vi.fn();

vi.mock("../services/recommendation.service", () => ({
  recommendationService: {
    getNextQuestion: (...args: unknown[]) => mockGetNextQuestion(...args),
  },
}));

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const MOCK_QUESTION = {
  id: 42,
  question_text: "Find the derivative of $x^3$",
  correct_answer: "A",
  choices: [
    { id: "A", text: "3x^2", error_code: "correct_answer" },
    { id: "B", text: "x^2",  error_code: "exponent_rule_error" },
  ],
  difficulty: 0.5,
  bloom_level: "apply",
  skill_id: "derivatives",
};

const MOCK_HARDER_QUESTION = {
  ...MOCK_QUESTION,
  id: 43,
  difficulty: 0.8,
  question_text: "Find the derivative of $\\sin(x^2)$",
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useAdaptiveQuiz", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the first question on mount with default 'normal' adjustment", async () => {
    mockGetNextQuestion.mockResolvedValueOnce(MOCK_QUESTION);

    const { result } = renderHook(() => useAdaptiveQuiz("derivatives"));

    // Initially should be loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.currentQuestion).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // After load completes
    expect(result.current.currentQuestion).toEqual(MOCK_QUESTION);
    expect(result.current.error).toBeNull();

    // Verify the service was called with default "normal"
    expect(mockGetNextQuestion).toHaveBeenCalledWith("derivatives", "normal");
  });

  it("passes difficulty_adjustment parameter when fetchNext is called", async () => {
    mockGetNextQuestion
      .mockResolvedValueOnce(MOCK_QUESTION)        // initial mount
      .mockResolvedValueOnce(MOCK_HARDER_QUESTION); // explicit "harder" call

    const { result } = renderHook(() => useAdaptiveQuiz("derivatives"));

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Now call fetchNext with "harder"
    await act(async () => {
      await result.current.fetchNext("harder");
    });

    // The second call should have passed "harder"
    expect(mockGetNextQuestion).toHaveBeenCalledTimes(2);
    expect(mockGetNextQuestion).toHaveBeenNthCalledWith(2, "derivatives", "harder");
    expect(result.current.currentQuestion).toEqual(MOCK_HARDER_QUESTION);
  });

  it("supports 'easier' difficulty adjustment", async () => {
    mockGetNextQuestion
      .mockResolvedValueOnce(MOCK_QUESTION)
      .mockResolvedValueOnce({ ...MOCK_QUESTION, id: 44, difficulty: 0.2 });

    const { result } = renderHook(() => useAdaptiveQuiz("integration"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.fetchNext("easier");
    });

    expect(mockGetNextQuestion).toHaveBeenNthCalledWith(2, "integration", "easier");
  });

  it("sets error state when the service call fails", async () => {
    mockGetNextQuestion.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useAdaptiveQuiz("derivatives"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.currentQuestion).toBeNull();
  });

  it("clears previous error on successful retry", async () => {
    mockGetNextQuestion
      .mockRejectedValueOnce(new Error("Network error"))  // first call fails
      .mockResolvedValueOnce(MOCK_QUESTION);               // retry succeeds

    const { result } = renderHook(() => useAdaptiveQuiz("derivatives"));

    // Wait for the error state
    await waitFor(() => {
      expect(result.current.error).toBe("Network error");
    });

    // Retry
    await act(async () => {
      await result.current.fetchNext("normal");
    });

    expect(result.current.error).toBeNull();
    expect(result.current.currentQuestion).toEqual(MOCK_QUESTION);
  });

  it("transitions through loading states correctly", async () => {
    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockGetNextQuestion.mockReturnValueOnce(pendingPromise);

    const { result } = renderHook(() => useAdaptiveQuiz("derivatives"));

    // Should be loading while promise is pending
    expect(result.current.isLoading).toBe(true);

    // Resolve the promise
    await act(async () => {
      resolvePromise!(MOCK_QUESTION);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.currentQuestion).toEqual(MOCK_QUESTION);
  });
});
