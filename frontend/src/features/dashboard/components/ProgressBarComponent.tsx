// src/features/dashboard/components/ProgressBarComponent.tsx

interface ProgressBarComponentProps {
  label: string;
  current: number;
  total: number;
  color?: string;
}

/**
 * Progress Bar Component - ใช้แสดงความก้าวหน้า
 */
export function ProgressBarComponent({
  label,
  current,
  total,
  color = "bg-blue-500",
}: ProgressBarComponentProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-gray-600">{current}%</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
