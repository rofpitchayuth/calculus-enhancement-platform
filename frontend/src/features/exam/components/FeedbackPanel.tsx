/**
 * FeedbackPanel.tsx — Presentational Component
 * ==============================================
 * Renders the AI grader's response after the student submits an answer.
 *
 * Props:
 *   result        - GraderResponse from the backend.
 *   onNext        - Callback to advance (or end) the session.
 *   isLastQuestion - When true the CTA says "ดูสรุปผล" instead of "ข้อถัดไป".
 *
 * Design rules:
 *   - Stateless: no useState, no useEffect, no API calls.
 *   - The feedback_text may contain LaTeX — pass it through renderMathText.
 *   - Error codes are displayed as a styled "badge" with a human-readable label.
 */

import type { GraderResponse } from "../types/grader.types";
import { renderMathText } from "./mathRenderer";

// ---------------------------------------------------------------------------
// Error code → human-readable Thai label
// ---------------------------------------------------------------------------

const ERROR_CODE_LABELS: Record<string, string> = {
  correct_answer:                  "✅ คำตอบถูกต้อง",
  sign_error:                      "เครื่องหมายผิด (Sign Error)",
  arithmetic_error:                "คำนวณผิด (Arithmetic Error)",
  fraction_operation_error:        "การดำเนินการเศษส่วนผิด",
  algebra_simplification_error:    "การทำให้เรียบง่ายทางพีชคณิตผิด",
  forgot_chain_rule_inner:         "ลืมอนุพันธ์ฟังก์ชันภายใน (Chain Rule)",
  product_quotient_mixup:          "สับสน Product/Quotient Rule",
  derivative_instead_of_integral:  "ใช้อนุพันธ์แทนปริพันธ์",
  forgot_plus_c:                   "ลืมบวก +C",
  wrong_u_sub_bounds:              "กำหนดขอบเขต u-sub ผิด",
  trig_sign_error:                 "เครื่องหมายฟังก์ชันตรีโกณผิด",
  composite_evaluation_error:      "คำนวณฟังก์ชันประกอบผิด",
  trig_evaluation_error:           "ค่าฟังก์ชันตรีโกณผิด",
  exponent_rule_error:             "กฎเลขชี้กำลังผิด",
  logarithm_rule_error:            "กฎลอการิทึมผิด",
  unclassified_error:              "ข้อผิดพลาดที่ยังระบุประเภทไม่ได้",
  conceptual_misunderstanding:     "เข้าใจแนวคิดผิด",
  indeterminate_form_misconception:"เข้าใจรูปแบบไม่จำกัดผิด",
  lhopital_applied_incorrectly:    "ใช้กฎ L'Hôpital ผิดเงื่อนไข",
  wrong_trig_derivative_sign:      "เครื่องหมายอนุพันธ์ตรีโกณผิด",
  constant_derivative_error:       "อนุพันธ์ของค่าคงที่ผิด",
  u_sub_forgot_du:                 "ลืม du ใน u-substitution",
  wrong_integration_formula:       "สูตรปริพันธ์ผิด",
  radius_squared_error:            "ใช้รัศมีแทนรัศมีกำลังสองผิด",
  wrong_curve_order_area:          "ลำดับเส้นโค้งสำหรับหาพื้นที่ผิด",
  endpoint_extrema_forgotten:      "ลืมตรวจสอบค่าสุดขีดที่ขอบเขต",
};

function getErrorLabel(code: string): string {
  return ERROR_CODE_LABELS[code] ?? code.replace(/_/g, " ");
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FeedbackPanelProps {
  result: GraderResponse;
  onNext: () => void;
  onAdaptiveNext?: () => void; // For continuous practice mode
  isLastQuestion: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FeedbackPanel({ 
  result, 
  onNext, 
  onAdaptiveNext, 
  isLastQuestion 
}: FeedbackPanelProps) {
  // STRICT CHECK: Consider it correct if is_correct is true OR error_code is 'correct_answer'
  const isTrulyCorrect = result.is_correct || result.error_code === 'correct_answer';
  const { error_code, feedback_text } = result;

  return (
    <div
      className={[
        "mt-6 rounded-2xl border-2 p-6 shadow-lg transition-all",
        isTrulyCorrect
          ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50"
          : "border-rose-300 bg-gradient-to-br from-rose-50 to-red-50",
      ].join(" ")}
    >
      {/* ── Result badge ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white text-2xl font-bold shadow-md",
            isTrulyCorrect ? "bg-emerald-500" : "bg-rose-500",
          ].join(" ")}
        >
          {isTrulyCorrect ? "✓" : "✗"}
        </div>
        <div>
          <h3
            className={[
              "text-lg font-bold",
              isTrulyCorrect ? "text-emerald-700" : "text-rose-700",
            ].join(" ")}
          >
            {isTrulyCorrect ? "ถูกต้อง! เยี่ยมมาก 🎉" : "ยังไม่ถูก — ลองดูคำอธิบายด้านล่าง"}
          </h3>
          <p className="text-sm text-gray-500">
            ตัวเลือกที่เลือก:{" "}
            <span className="font-semibold text-gray-700">{result.selected_choice}</span>
          </p>
        </div>
      </div>

      {/* ── Error code badge ──────────────────────────────────────────── */}
      <div className="mb-5">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Error Code
        </p>
        <span
          className={[
            "inline-block rounded-full px-3 py-1 text-sm font-semibold",
            isTrulyCorrect
              ? "bg-emerald-100 text-emerald-800"
              : "bg-rose-100 text-rose-800",
          ].join(" ")}
        >
          {getErrorLabel(error_code)}
        </span>
        {!isTrulyCorrect && (
          <p className="mt-1 text-xs text-gray-500">
            รหัสข้อผิดพลาด:{" "}
            <code className="rounded bg-gray-100 px-1 font-mono text-gray-700">
              {error_code}
            </code>
          </p>
        )}
      </div>

      {/* ── Step-by-step analysis ─────────────────────────────────────── */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          การวิเคราะห์ทีละขั้นตอน
        </p>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-inner">
          <div className="text-sm leading-7 text-gray-700">
            {/* feedback_text may contain LaTeX; renderMathText handles $…$ segments */}
            {renderMathText(feedback_text)}
          </div>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {onAdaptiveNext && (
          <button
            onClick={onAdaptiveNext}
            className="w-full rounded-full py-3 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all duration-200 active:scale-95"
          >
            ต่อไป: ฝึกฝนในระดับที่ยากขึ้น →
          </button>
        )}
        
        <button
          onClick={onNext}
          className={[
            "w-full rounded-full py-3 text-base font-semibold text-white shadow-md",
            "transition-all duration-200 active:scale-95",
            isTrulyCorrect
              ? "bg-emerald-500 hover:bg-emerald-600"
              : "bg-slate-400 hover:bg-slate-500",
          ].join(" ")}
        >
          {isLastQuestion ? "ดูสรุปผลการทดสอบ →" : "ข้อถัดไป (ในชุดเดิม) →"}
        </button>
      </div>
    </div>
  );
}
