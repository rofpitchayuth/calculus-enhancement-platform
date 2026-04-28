/**
 * errorMapper.ts — Presentation Layer (Utility)
 * ============================================
 * Maps machine-readable error codes (from AI Grader/KT Engine)
 * to human-readable, encouraging Thai descriptions.
 */

const ERROR_MAP: Record<string, { th: string; en: string }> = {
  // --- New Natural Thai Localization ---
  "correct_answer": {
    th: "ตอบถูกต้อง! เยี่ยมมาก ทำได้ดีมากครับ",
    en: "Correct answer! Well done.",
  },
  "arithmetic_error": {
    th: "เกิดข้อผิดพลาดในการคำนวณพื้นฐาน ลองค่อยๆ ตรวจสอบเครื่องหมายหรือการบวกเลขดูอีกครั้งนะ",
    en: "Basic calculation error. Double check your signs or basic arithmetic.",
  },
  "forgot_plus_c": {
    th: "เกือบสมบูรณ์แบบแล้ว! แต่อย่าลืมเติมค่าคงที่ +C ต่อท้ายหลังอินทิเกรตเสร็จด้วยนะ",
    en: "Almost perfect! Don't forget to add the constant +C after integrating.",
  },
  "chain_rule_error": {
    th: "ระวังเรื่องกฎลูกโซ่ (Chain Rule) ลองทบทวนการดิฟไส้ข้างในอีกรอบนะ",
    en: "Watch out for the Chain Rule. Try reviewing the inner function's derivative.",
  },
  "unclassified_error": {
    th: "คำตอบยังไม่ถูกต้อง ลองดูคำอธิบายวิธีทำทีละขั้นตอนด้านล่างนะ",
    en: "Incorrect answer. Check the step-by-step explanation below.",
  },
  "Sign Error": {
    th: "เครื่องหมายผิดไปนิดเดียว ลองเช็คเครื่องหมายบวก/ลบในขั้นตอนการคำนวณนะ",
    en: "Sign error. Check your +/- signs during calculations.",
  },
  "Forgot +C": {
    th: "เกือบถูกแล้ว! อย่าลืมบวกค่าคงที่ +C หลังการอินทิเกรตเสมอนะ",
    en: "Don't forget the +C constant after integration.",
  },
  "Chain Rule Misapplication": {
    th: "การใช้กฎลูกโซ่ผิดพลาด ลองตรวจสอบการหาอนุพันธ์ของฟังก์ชันภายในดูอีกที",
    en: "Chain rule misapplied. Re-check the derivative of the inner function.",
  }
};

/**
 * Translates an error code to its Thai description.
 * Falls back to a generic message if no mapping is found.
 */
export function mapErrorCodeToThai(errorCode: string): string {
  if (errorCode === 'correct_answer') return ERROR_MAP[errorCode].th;
  return ERROR_MAP[errorCode]?.th ?? "คำตอบยังไม่ถูกต้อง ลองตรวจสอบวิธีการคิดอีกครั้งนะ";
}

/**
 * Translates an error code to its English description.
 */
export function mapErrorCodeToEnglish(errorCode: string): string {
  return ERROR_MAP[errorCode]?.en ?? errorCode;
}
