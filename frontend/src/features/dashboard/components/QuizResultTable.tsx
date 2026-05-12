import { renderMathText } from '../../exam/components/mathRenderer';

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
    <div className="overflow-hidden mt-6 rounded-3xl border border-gray-100 shadow-xl bg-white">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-[#003B62] to-[#005a96] text-white">
            <th className="py-5 px-6 font-bold text-sm uppercase tracking-wider w-20 text-center">ข้อ</th>
            <th className="py-5 px-6 font-bold text-sm uppercase tracking-wider">โจทย์</th>
            <th className="py-5 px-6 font-bold text-sm uppercase tracking-wider w-64">ตัวเลือก</th>
            <th className="py-5 px-6 font-bold text-sm uppercase tracking-wider w-32 text-center">คำตอบ</th>
            <th className="py-5 px-6 font-bold text-sm uppercase tracking-wider w-32 text-center">เฉลย</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {questions.map((q, idx) => {
            const userAns = q.user_answer?.toUpperCase() || '-';
            const correctAns = q.correct_answer?.toUpperCase() || '-';

            return (
              <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                <td className="py-6 px-6 text-center">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-[#003B62] font-bold text-lg border border-blue-100">
                    {q.question_number}
                  </span>
                </td>
                <td className="py-6 px-6">
                  <div className="text-gray-800 text-base leading-relaxed font-medium">
                    {renderMathText(q.question_text)}
                  </div>
                </td>
                <td className="py-6 px-6">
                  <div className="flex flex-col gap-2">
                    {(q.choices ?? []).map((c) => {
                      const isSelected = c.id.toUpperCase() === userAns;
                      const isCorrect = c.id.toUpperCase() === correctAns;
                      
                      return (
                        <div 
                          key={c.id} 
                          className={`flex items-start gap-2 p-2 rounded-xl text-sm transition-all ${
                            isSelected && q.is_correct ? 'bg-green-50 text-green-700' :
                            isSelected && !q.is_correct ? 'bg-red-50 text-red-700' :
                            isCorrect ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                            'text-gray-600'
                          }`}
                        >
                          <span className="font-bold min-w-[20px]">{c.id.toUpperCase()}.</span>
                          <span className="flex-1">{renderMathText(c.text)}</span>
                        </div>
                      );
                    })}
                  </div>
                </td>
                <td className="py-6 px-6 text-center">
                  <div className={`inline-flex flex-col items-center justify-center w-14 h-14 rounded-2xl shadow-sm border-2 ${
                    q.is_correct
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      : 'bg-rose-50 border-rose-200 text-rose-600'
                  }`}>
                    <span className="text-xl font-black uppercase">{userAns}</span>
                    <span className="text-[10px] font-bold mt-0.5">
                      {q.is_correct ? '✓' : '✗'}
                    </span>
                  </div>
                </td>
                <td className="py-6 px-6 text-center">
                  <div className="inline-flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-yellow-50 border-2 border-yellow-200 text-yellow-700 shadow-sm">
                    <span className="text-xl font-black uppercase">{correctAns}</span>
                    <span className="text-[10px] font-bold mt-0.5 uppercase">ANSWER</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}