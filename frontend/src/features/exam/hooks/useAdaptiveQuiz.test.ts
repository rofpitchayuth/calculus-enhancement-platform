import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAdaptiveQuiz } from "./useAdaptiveQuiz";

// Mock the recommendation service
const mockGetNextQuestion = vi.fn();

vi.mock("../services/recommendation.service", () => ({
  recommendationService: {
    getNextQuestion: (...args: unknown[]) => mockGetNextQuestion(...args),
  },
}));

// Test data
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
  skill_id: "DIFFERENTIAL",
};

const MOCK_HARDER_QUESTION = {
  ...MOCK_QUESTION,
  id: 43,
  difficulty: 0.8,
  question_text: "Find the derivative of $\\sin(x^2)$",
};

describe("useAdaptiveQuiz", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the first question on mount with default 'normal' adjustment", async () => {
    mockGetNextQuestion.mockResolvedValueOnce(MOCK_QUESTION);

    const { result } = renderHook(() => useAdaptiveQuiz("DIFFERENTIAL"));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.currentQuestion).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.currentQuestion).toEqual(MOCK_QUESTION);
    expect(result.current.error).toBeNull();

    expect(mockGetNextQuestion).toHaveBeenCalledWith("DIFFERENTIAL", "normal");
  });

  it("passes difficulty_adjustment parameter when fetchNext is called", async () => {
    mockGetNextQuestion
      .mockResolvedValueOnce(MOCK_QUESTION)       
      .mockResolvedValueOnce(MOCK_HARDER_QUESTION);

    const { result } = renderHook(() => useAdaptiveQuiz("DIFFERENTIAL"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    await act(async () => {
      await result.current.fetchNext("harder");
    });

    expect(mockGetNextQuestion).toHaveBeenCalledTimes(2);
    expect(mockGetNextQuestion).toHaveBeenNthCalledWith(2, "DIFFERENTIAL", "harder");
    expect(result.current.currentQuestion).toEqual(MOCK_HARDER_QUESTION);
  });

  it("supports 'easier' difficulty adjustment", async () => {
    mockGetNextQuestion
      .mockResolvedValueOnce(MOCK_QUESTION)
      .mockResolvedValueOnce({ ...MOCK_QUESTION, id: 44, difficulty: 0.2 });

    const { result } = renderHook(() => useAdaptiveQuiz("INTEGRAL"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.fetchNext("easier");
    });

    expect(mockGetNextQuestion).toHaveBeenNthCalledWith(2, "INTEGRAL", "easier");
  });

  it("sets error state when the service call fails", async () => {
    mockGetNextQuestion.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useAdaptiveQuiz("DIFFERENTIAL"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.currentQuestion).toBeNull();
  });

  it("clears previous error on successful retry", async () => {
    mockGetNextQuestion
      .mockRejectedValueOnce(new Error("Network error"))    
      .mockResolvedValueOnce(MOCK_QUESTION);

    const { result } = renderHook(() => useAdaptiveQuiz("DIFFERENTIAL"));

    await waitFor(() => {
      expect(result.current.error).toBe("Network error");
    });

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

    const { result } = renderHook(() => useAdaptiveQuiz("DIFFERENTIAL"));

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise!(MOCK_QUESTION);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.currentQuestion).toEqual(MOCK_QUESTION);
  });
});
