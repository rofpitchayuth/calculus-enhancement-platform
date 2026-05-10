// QuizResultTable.tsx — แก้ type และการ render

type QuizQuestion = {
  question_number: number;
  question_text: string;
  choices: { id: string; text: string }[];
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
};

type Props = {
  questions: QuizQuestion[];
};

export function QuizResultTable({ questions }: Props) {
  return (
    <div className="overflow-x-auto mt-4 rounded-2xl shadow-md">
      <table className="w-full text-sm bg-white">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="py-3 px-4 text-left font-semibold text-gray-700 w-12">ข้อ</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">โจทย์</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">ตัวเลือก</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">คำตอบที่เลือก</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">เฉลย</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, idx) => (
            <tr key={idx} className={idx !== questions.length - 1 ? 'border-b' : ''}>
              <td className="py-3 px-4 text-center font-medium text-[#003B62]">
                {q.question_number}
              </td>
              <td className="py-3 px-4 text-gray-800">{q.question_text}</td>
              <td className="py-3 px-4">
                <div className="flex flex-col gap-1">
                  {(q.choices ?? []).map((c) => (
                    <span key={c.id} className="text-gray-600">
                      {c.id}. {c.text}
                    </span>
                  ))}
                </div>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-lg font-medium text-xs ${
                  q.is_correct
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {q.user_answer}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className="px-2 py-1 bg-yellow-100 text-gray-800 rounded-lg font-medium text-xs">
                  {q.correct_answer}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}