// src/features/dashboard/components/BloomBar.tsx

import type { BloomLevel } from "../types/dashboard.types";

/**
 * Bloom Bar Component - แสดง Accuracy (Percentage of Correct Answers)
 * สำหรับแต่ละ Bloom's Level
 */
export function BloomBar({ label, accuracy, total_attempts, correct_attempts }: BloomLevel) {
  const percentText = total_attempts > 0 ? `${Math.round(accuracy)}% (${correct_attempts}/${total_attempts} ข้อ)` : `N/A (0/0 ข้อ)`;
  const widthStr = total_attempts > 0 ? `${Math.round(accuracy)}%` : `0%`;

  return (
    <div>
      <div className="flex justify-between text-xs mb-1 font-semibold text-gray-700">
        <span>{label}</span>
        <span className={total_attempts === 0 ? "text-gray-400" : ""}>{percentText}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-in-out ${total_attempts > 0 ? 'bg-yellow-400' : 'bg-transparent'}`}
          style={{ width: widthStr }}
        />
      </div>
    </div>
  );
}
