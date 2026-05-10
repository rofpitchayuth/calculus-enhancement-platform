/**
 * errorMapper.ts — Presentation Layer (Utility)
 * ============================================
 * Maps machine-readable error codes (from AI Grader/KT Engine)
 * to human-readable, encouraging Thai descriptions.
 */

// Map all backend ErrorCodeEnum values to UI-friendly text
export const ERROR_MAP: Record<string, { th: string; en: string }> = {
  "correct_answer": {
    th: "ตอบถูกต้อง! เยี่ยมมาก ทำได้ดีมากครับ",
    en: "Correct answer! Well done.",
  },
  "sign_error": {
    th: "เครื่องหมายผิดไปนิดเดียว ลองเช็คเครื่องหมายบวก/ลบในขั้นตอนการคำนวณนะ",
    en: "Sign error. Check your +/- signs during calculations.",
  },
  "arithmetic_error": {
    th: "เกิดข้อผิดพลาดในการคำนวณพื้นฐาน ลองค่อยๆ ตรวจสอบการบวกลบคูณหารดูอีกครั้งนะ",
    en: "Basic calculation error. Double check your arithmetic.",
  },
  "fraction_operation_error": {
    th: "ระวังเรื่องการคำนวณเศษส่วน! ลองทบทวนการบวกลบหรือคูณหารเศษส่วนดูอีกทีนะ",
    en: "Fraction operation error. Review your fraction arithmetic.",
  },
  "algebra_simplification_error": {
    th: "พลาดตรงการจัดรูปสมการนิดหน่อย ลองค่อยๆ กระจายพจน์หรือดึงตัวร่วมใหม่นะ",
    en: "Algebraic simplification error. Check your polynomial expansion or factoring.",
  },
  "forgot_chain_rule_inner": {
    th: "ระวังเรื่องกฎลูกโซ่ (Chain Rule) อย่าลืมคูณด้วยดิฟไส้ข้างในด้วยนะ",
    en: "Forgot the chain rule. Remember to multiply by the derivative of the inner function.",
  },
  "product_quotient_mixup": {
    th: "สับสนระหว่างสูตรดิฟผลคูณกับผลหารหรือเปล่า? ลองทบทวนสูตรดูนะ",
    en: "Mixed up product and quotient rules. Double-check the formula applied.",
  },
  "derivative_instead_of_integral": {
    th: "ระวังจำสลับกันนะ! ข้อนี้ต้องหาอินทิกรัล (ปริพันธ์) ไม่ใช่หาอนุพันธ์ (ดิฟ) ครับ",
    en: "You took the derivative instead of the integral. Watch the notation!",
  },
  "forgot_plus_c": {
    th: "เกือบสมบูรณ์แบบแล้ว! แต่อย่าลืมเติมค่าคงที่ +C ต่อท้ายหลังอินทิเกรตแบบไม่จำกัดเขตด้วยนะ",
    en: "Almost perfect! Don't forget to add the constant +C after indefinite integration.",
  },
  "wrong_u_sub_bounds": {
    th: "เปลี่ยนตัวแปร u แล้ว อย่าลืมเปลี่ยนขอบเขตการอินทิเกรต (Bounds) ให้เป็นของ u ด้วยนะ",
    en: "Forgot to update the integration bounds after u-substitution.",
  },
  "trig_sign_error": {
    th: "ดิฟ/อินทิเกรตตรีโกณมิติเครื่องหมายผิดไปนิด (เช่น ดิฟ cos ได้ -sin) ลองเช็คดูอีกทีนะ",
    en: "Trigonometric sign error. Double check your formulas.",
  },
  "composite_evaluation_error": {
    th: "ระวังการแทนค่าฟังก์ชันประกอบ (Composite Function) ค่อยๆ แทนค่าจากข้างในออกมานะ",
    en: "Error evaluating a composite function. Work from the inside out.",
  },
  "trig_evaluation_error": {
    th: "แทนค่ามุมตรีโกณมิติผิดไปนิด ลองเช็คค่า sin, cos, tan ของมุมนี้บนวงกลมหนึ่งหน่วยดูใหม่นะ",
    en: "Error evaluating trigonometric values. Double check the unit circle.",
  },
  "exponent_rule_error": {
    th: "กฎเลขยกกำลังผิดพลาดนิดหน่อย ลองทบทวนสมบัติของเลขยกกำลังดูนะ",
    en: "Exponent rule error. Review the properties of exponents.",
  },
  "logarithm_rule_error": {
    th: "การใช้สมบัติลอการิทึม (Log) ยังไม่ถูกต้อง ลองทบทวนกฎของ Log ดูอีกทีครับ",
    en: "Logarithm rule error. Review the properties of logarithms.",
  },
  "power_rule_error": {
    th: "ใช้กฎยกกำลัง (Power Rule) พลาดไปนิด ลองเช็คการตบเลขชี้กำลังลงมาคูณแล้วลบออกหนึ่งดูนะ",
    en: "Power rule error. Check your formula execution.",
  },
  "unclassified_error": {
    th: "คำตอบยังไม่ถูกต้อง ลองดูคำอธิบายวิธีทำทีละขั้นตอนด้านล่างนะ",
    en: "Incorrect answer. Check the step-by-step explanation below.",
  },
  "conceptual_misunderstanding": {
    th: "อาจจะยังเข้าใจคอนเซปต์ข้อนี้คลาดเคลื่อนไป ลองกลับไปทบทวนเนื้อหาหลักดูนะครับ",
    en: "Conceptual misunderstanding. Try reviewing the core theory for this topic.",
  },
  "indeterminate_form_misconception": {
    th: "ระวังเรื่องรูปแบบยังไม่กำหนด (Indeterminate form) เช่น 0/0 ลองจัดรูปใหม่หรือใช้กฎโลปิตาลดูนะ",
    en: "Misconception with indeterminate forms (like 0/0). Try factoring or L'Hopital's rule.",
  },
  "lhopital_applied_incorrectly": {
    th: "ใช้กฎโลปิตาล (L'Hopital's Rule) คลาดเคลื่อน ลองแยกดิฟเศษและดิฟส่วนดูนะ (ไม่ใช่ดิฟผลหาร)",
    en: "Applied L'Hopital's rule incorrectly. Differentiate numerator and denominator separately.",
  },
  "wrong_trig_derivative_sign": {
    th: "จำเครื่องหมายดิฟตรีโกณผิดไปนิด (ปกติฟังก์ชันที่ขึ้นต้นด้วย c มักจะติดลบนะ)",
    en: "Wrong sign on trig derivative. Remember, derivatives of 'c' functions usually get a minus.",
  },
  "constant_derivative_error": {
    th: "อย่าลืมนะว่า ดิฟค่าคงที่ (ตัวเลขเดี่ยวๆ) ต้องได้ 0 เสมอครับ",
    en: "Remember, the derivative of a constant is always 0.",
  },
  "u_sub_forgot_du": {
    th: "ตอนใช้เทคนิคเปลี่ยนตัวแปร u อย่าลืมหา du/dx มาชดเชยค่า dx เดิมด้วยนะ",
    en: "Forgot the 'du' term during u-substitution. Substitute dx properly.",
  },
  "wrong_integration_formula": {
    th: "ใช้สูตรอินทิเกรตผิดไปนิด ลองเปิดตารางสูตรอินทิเกรตเทียบดูอีกครั้งนะ",
    en: "Used the wrong integration formula. Check your formula sheet.",
  },
  "radius_squared_error": {
    th: "ตอนหาปริมาตร (Disk/Washer method) อย่าลืมจับรัศมีไปยกกำลังสอง (R^2) ด้วยนะ",
    en: "Forgot to square the radius in the volume formula (Disk/Washer method).",
  },
  "wrong_curve_order_area": {
    th: "ตั้งสมการหาพื้นที่ผิดสลับกัน ลองวาดกราฟเช็คว่าเส้นไหนอยู่บน (Top) เส้นไหนอยู่ล่าง (Bottom) นะ",
    en: "Subtracted the curves in the wrong order. Check which curve is on top.",
  },
  "endpoint_extrema_forgotten": {
    th: "การหาจุดสุดขีดสัมบูรณ์ (Absolute Extrema) อย่าลืมนำจุดปลายช่วง (Endpoints) มาเช็คด้วยเสมอ!",
    en: "Forgot to check the endpoints when finding absolute extrema.",
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
