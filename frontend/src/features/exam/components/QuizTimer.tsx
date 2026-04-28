// components/QuizTimer.tsx

import { useEffect, useState } from 'react';

interface QuizTimerProps {
  totalSeconds: number;        // เวลาเริ่มต้น เช่น 10*60+29 = 629
  currentIndex: number;
  totalQuestions: number;
  onTimeUp?: () => void;
}

export function QuizTimer({
  totalSeconds,
  currentIndex,
  totalQuestions,
  onTimeUp,
}: QuizTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onTimeUp?.();
      return;
    }
    const id = setInterval(() => setRemaining((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [remaining, onTimeUp]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isLow   = remaining <= 60; // เหลือน้อยกว่า 1 นาที → แดง

  return (
    <div className="flex flex-col items-center gap-3 bg-white rounded-3xl px-8 py-4 shadow-sm w-60">
      {/* Countdown */}
      <div className={`text-2xl font-bold tracking-tight ${isLow ? 'text-red-500' : 'text-red-500'}`}>
        <span>{minutes} นาที</span>
        {' '}
        <span>{seconds.toString().padStart(2, '0')} วินาที</span>
      </div>

      {/* Question progress */}
      <div className="bg-yellow-400 text-gray-800 font-semibold text-sm px-8 py-2 rounded-full w-full text-center">
        ข้อที่ {currentIndex + 1} / {totalQuestions}
      </div>
    </div>
  );
}