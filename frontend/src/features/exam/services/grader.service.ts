/**
 * grader.service.ts — Legacy Bridge (Infrastructure Layer)
 * ========================================================
 * REFACTORED: This service is now a legacy bridge. 
 * ALL student quiz submissions should use quizService.submitAnswer().
 */

import type { GraderRequest, GraderResponse } from "../types/grader.types";

import { API_BASE_URL as API_BASE } from '../../../shared/api/config';
const STANDARD_TIMEOUT_MS = 15_000; // 15 seconds (Database-driven)

export const graderService = {
  /**
   * @deprecated Use quizService.submitAnswer instead for student flow.
   * Redirects to the unified quiz submit endpoint.
   */
  async analyzeAnswer(payload: GraderRequest): Promise<GraderResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), STANDARD_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE}/quiz/submit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify({
            user_id: payload.student_id,
            session_id: (payload as any).session_id, 
            question_id: payload.question_id,
            user_answer: payload.selected_choice,
            response_latency: payload.response_latency
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("ไม่สามารถส่งคำตอบได้ กรุณาลองใหม่อีกครั้ง");
      }

      return response.json();
    } catch (err: unknown) {
      throw new Error("ไม่สามารถเชื่อมต่อกับระบบได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      clearTimeout(timeoutId);
    }
  },
};
