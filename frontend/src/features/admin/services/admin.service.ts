/**
 * admin.service.ts — Infrastructure / Data Access Layer
 * ========================================================
 * Handles communication with the /api/v1/admin endpoints.
 */

import type { QuestionDraftRequest, QuestionAnalysis, QuestionSaveRequest } from "../types/admin.types";

import { API_BASE_URL as API_BASE } from '../../../shared/api/config';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const adminService = {
  /**
   * Submit a new question for AI analysis.
   * Returns a draft analysis including taxonomy and error codes.
   */
  async generateDraft(payload: QuestionDraftRequest): Promise<QuestionAnalysis> {
    const response = await fetch(`${API_BASE}/admin/draft-question`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to generate AI draft.");
    }

    return response.json();
  },

  /**
   * Save the finalized, expert-reviewed question to the database.
   */
  async saveQuestion(payload: QuestionSaveRequest): Promise<{ id: number; message: string }> {
    const response = await fetch(`${API_BASE}/admin/save-question`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to save question.");
    }

    return response.json();
  },
};
