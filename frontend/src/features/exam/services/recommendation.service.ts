/**
 * recommendation.service.ts — Infrastructure Layer
 * ===============================================
 * Handles fetching adaptive questions from the recommendation engine.
 */

import type { Question } from "../types/grader.types"; // Reusing existing Question type

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const recommendationService = {
  /**
   * Fetches the next question suited for the student's mastery level in a topic.
   */
  async getNextQuestion(subTopic: string, difficultyAdjustment: string = "normal"): Promise<Question> {
    const url = `${API_BASE}/recommendations/next-question?sub_topic=${encodeURIComponent(subTopic)}&difficulty_adjustment=${difficultyAdjustment}`;
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch recommendation.");
    }

    return response.json();
  },
};
