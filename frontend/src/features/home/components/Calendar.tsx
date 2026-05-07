import { useState } from "react";
import { Card } from "../../../shared/components/ui/Card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
}

export function Calendar({ onDateSelect }: CalendarProps) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleSelect = (day: number) => {
    const date = new Date(year, month, day);
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const isSelected = (day: number) =>
    selectedDate?.getDate() === day &&
    selectedDate?.getMonth() === month &&
    selectedDate?.getFullYear() === year;

  // Cells: trailing days from prev month + current month + leading days of next month
  const cells: { day: number; type: "prev" | "current" | "next" }[] = [];

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, type: "prev" });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, type: "current" });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, type: "next" });
  }

  return (
    <Card className="p-6 shadow-lg h-full flex flex-col bg-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-600"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-base font-semibold text-gray-800">
          {monthNames[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-600"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 flex-1">
        {cells.map((cell, idx) => {
          const isCurrent = cell.type === "current";
          const selected = isCurrent && isSelected(cell.day);
          const todayCell = isCurrent && isToday(cell.day);

          return (
            <button
              key={idx}
              disabled={!isCurrent}
              onClick={() => isCurrent && handleSelect(cell.day)}
              className={`
                aspect-square flex items-center justify-center rounded-full text-sm transition-colors mx-auto w-8 h-8
                ${!isCurrent ? "text-gray-300 cursor-default" : "cursor-pointer"}
                ${selected
                  ? "bg-blue-600 text-white font-semibold"
                  : todayCell
                  ? "border border-blue-500 text-blue-600 font-semibold hover:bg-blue-50"
                  : isCurrent
                  ? "text-gray-700 hover:bg-gray-100"
                  : ""}
              `}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
