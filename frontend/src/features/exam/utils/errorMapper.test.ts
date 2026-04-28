/**
 * errorMapper.test.ts — Utility Tests
 * =====================================
 * Tests the mapErrorCodeToThai and mapErrorCodeToEnglish functions
 * to ensure proper mapping of machine-readable error codes to
 * human-readable descriptions.
 */

import { describe, it, expect } from "vitest";
import { mapErrorCodeToThai, mapErrorCodeToEnglish } from "./errorMapper";

describe("mapErrorCodeToThai", () => {
  it("maps 'correct_answer' to a Thai success message", () => {
    const result = mapErrorCodeToThai("correct_answer");
    expect(result).toBe("ตอบถูกต้อง! เยี่ยมมาก ทำได้ดีมากครับ");
  });

  it("maps 'forgot_plus_c' to its Thai description mentioning +C", () => {
    const result = mapErrorCodeToThai("forgot_plus_c");
    expect(result).toContain("+C");
    expect(result).toContain("เกือบสมบูรณ์แบบแล้ว");
  });

  it("maps 'arithmetic_error' to a Thai description about calculation", () => {
    const result = mapErrorCodeToThai("arithmetic_error");
    expect(result).toContain("คำนวณ");
  });

  it("returns a fallback message for unknown error codes", () => {
    const result = mapErrorCodeToThai("some_unknown_code_xyz");
    expect(result).toBe("คำตอบยังไม่ถูกต้อง ลองตรวจสอบวิธีการคิดอีกครั้งนะ");
  });
});

describe("mapErrorCodeToEnglish", () => {
  it("maps 'correct_answer' to its English description", () => {
    const result = mapErrorCodeToEnglish("correct_answer");
    expect(result).toBe("Correct answer! Well done.");
  });

  it("maps 'forgot_plus_c' to its English description", () => {
    const result = mapErrorCodeToEnglish("forgot_plus_c");
    expect(result).toContain("+C");
  });

  it("returns the raw code for unknown error codes", () => {
    const result = mapErrorCodeToEnglish("some_unknown_code_xyz");
    expect(result).toBe("some_unknown_code_xyz");
  });
});
