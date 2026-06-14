/**
 * FeedbackPanel.test.tsx — Component Tests
 * ==========================================
 * Tests the FeedbackPanel presentational component to ensure:
 *   1. "Success" style renders ONLY when error_code === 'correct_answer'
 *   2. Error codes are mapped to human-readable Thai labels
 *   3. Incorrect answers display the raw error code badge
 *
 * Mocks: renderMathText is stubbed (returns plain text) so we can focus
 *        on the component logic without depending on KaTeX.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeedbackPanel } from "../components/FeedbackPanel";
import type { GraderResponse } from "../types/grader.types";

// ---------------------------------------------------------------------------
// Mock the mathRenderer to avoid KaTeX/katex.min.css dependency in tests
// ---------------------------------------------------------------------------
vi.mock("../components/mathRenderer", () => ({
  renderMathText: (text: string) => text,
}));

// ---------------------------------------------------------------------------
// Mock the react-katex module to prevent CSS import errors
// ---------------------------------------------------------------------------
vi.mock("react-katex", () => ({
  InlineMath: ({ math }: { math: string }) => math,
  BlockMath: ({ math }: { math: string }) => math,
}));

// ---------------------------------------------------------------------------
// Helper: Build a mock GraderResponse
// ---------------------------------------------------------------------------
function buildResult(overrides: Partial<GraderResponse> = {}): GraderResponse {
  return {
    student_id: 1,
    question_id: 10,
    selected_choice: "A",
    is_correct: false,
    error_code: "unclassified_error",
    feedback_text: "Some feedback",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("FeedbackPanel", () => {
  // ── Success state ──────────────────────────────────────────────────────

  it("renders the success style when error_code is 'correct_answer'", () => {
    const result = buildResult({
      is_correct: true,
      error_code: "correct_answer",
    });

    const { container } = render(
      <FeedbackPanel result={result} onNext={() => {}} isLastQuestion={false} />
    );

    // Target the <h3> heading specifically to avoid ambiguity with the error
    // badge span, which also contains "ถูกต้อง" (e.g. "✅ คำตอบถูกต้อง").
    expect(
      screen.getByRole("heading", { name: /ถูกต้อง! เยี่ยมมาก/ })
    ).toBeInTheDocument();
    // The success checkmark icon
    expect(screen.getByText("✓")).toBeInTheDocument();
    // The outer wrapper should have the emerald (success) border class
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain("border-emerald-300");
  });

  // ── Failure state ──────────────────────────────────────────────────────

  it("renders the failure style when error_code is NOT 'correct_answer'", () => {
    const result = buildResult({
      is_correct: false,
      error_code: "forgot_plus_c",
    });

    const { container } = render(
      <FeedbackPanel result={result} onNext={() => {}} isLastQuestion={false} />
    );

    // The failure heading text (Thai)
    expect(screen.getByText(/ยังไม่ถูก/)).toBeInTheDocument();
    // The failure cross icon
    expect(screen.getByText("✗")).toBeInTheDocument();
    // The outer wrapper should have the rose (failure) border class
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain("border-rose-300");
  });

  // ── Error code label mapping ───────────────────────────────────────────

  it("maps 'forgot_plus_c' to its Thai label 'ลืมบวก +C'", () => {
    const result = buildResult({
      is_correct: false,
      error_code: "forgot_plus_c",
    });

    render(
      <FeedbackPanel result={result} onNext={() => {}} isLastQuestion={false} />
    );

    // The Thai label for forgot_plus_c from the internal ERROR_CODE_LABELS map
    expect(screen.getByText("ลืมบวก +C")).toBeInTheDocument();
  });

  it("maps 'correct_answer' to 'คำตอบถูกต้อง'", () => {
    const result = buildResult({
      is_correct: true,
      error_code: "correct_answer",
    });

    render(
      <FeedbackPanel result={result} onNext={() => {}} isLastQuestion={false} />
    );

    expect(screen.getByText("คำตอบถูกต้อง")).toBeInTheDocument();
  });

  it("maps 'sign_error' to its Thai label containing 'เครื่องหมายผิด'", () => {
    const result = buildResult({
      is_correct: false,
      error_code: "sign_error",
    });

    render(
      <FeedbackPanel result={result} onNext={() => {}} isLastQuestion={false} />
    );

    expect(screen.getByText(/เครื่องหมายผิด/)).toBeInTheDocument();
  });

  // ── Raw error code badge ───────────────────────────────────────────────

  it("shows the raw error_code in a <code> element for incorrect answers", () => {
    const result = buildResult({
      is_correct: false,
      error_code: "arithmetic_error",
    });

    render(
      <FeedbackPanel result={result} onNext={() => {}} isLastQuestion={false} />
    );

    // The raw code should be visible inside a <code> tag
    const codeEl = screen.getByText("arithmetic_error");
    expect(codeEl.tagName).toBe("CODE");
  });

  it("does NOT show the raw error_code for correct answers", () => {
    const result = buildResult({
      is_correct: true,
      error_code: "correct_answer",
    });

    render(
      <FeedbackPanel result={result} onNext={() => {}} isLastQuestion={false} />
    );

    // "รหัสข้อผิดพลาด:" label should not be present for correct answers
    expect(screen.queryByText(/รหัสข้อผิดพลาด/)).not.toBeInTheDocument();
  });

  // ── CTA button text ────────────────────────────────────────────────────

  it("shows 'ดูสรุปผลการทดสอบ' when isLastQuestion is true", () => {
    const result = buildResult({ is_correct: true, error_code: "correct_answer" });

    render(
      <FeedbackPanel result={result} onNext={() => {}} isLastQuestion={true} />
    );

    expect(screen.getByText(/ดูสรุปผลการทดสอบ/)).toBeInTheDocument();
  });

  it("shows 'ข้อถัดไป' when isLastQuestion is false", () => {
    const result = buildResult({ is_correct: true, error_code: "correct_answer" });

    render(
      <FeedbackPanel result={result} onNext={() => {}} isLastQuestion={false} />
    );

    expect(screen.getByText(/ข้อถัดไป/)).toBeInTheDocument();
  });

  // ── Feedback text rendering ────────────────────────────────────────────

  it("renders the feedback_text content", () => {
    const result = buildResult({
      is_correct: false,
      error_code: "forgot_plus_c",
      feedback_text: "You forgot to add the constant of integration.",
    });

    render(
      <FeedbackPanel result={result} onNext={() => {}} isLastQuestion={false} />
    );

    expect(
      screen.getByText("You forgot to add the constant of integration.")
    ).toBeInTheDocument();
  });
});
