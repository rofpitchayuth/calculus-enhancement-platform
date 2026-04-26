import { useNavigate } from 'react-router-dom';

interface Course {
    id: string;
    title: string;
    description: string;
    numQuestions: number;
    duration: number; // นาที
    image?: string;
}

const courses: Course[] = [
    {
        id: 'differential',
        title: 'Differential',
        description:
            'บทที่เกี่ยวกับเรียนรู้การหาอนุพันธ์เพื่อวัดอัตราการเปลี่ยนแปลง เช่น ความเร็ว ความชัน หรือการเติบโตของฟังก์ชัน',
        numQuestions: 20,
        duration: 120,
    },
];

export default function AllCourse() {
    const navigate = useNavigate();

    const handleStartQuiz = (courseId: string) => {
        navigate(`/quiz/${courseId}`);
    };

    return (
        <div className="min-h-screen bg-blue-50 px-4 py-4">
            <h1 className="text-4xl font-extrabold text-[#003B62] mb-6">
                    COURSE
            </h1>
      

            {/* รายการคอร์ส */}
            <div className="flex flex-col gap-6">
                {courses.map((course) => (
                    <div
                        key={course.id}
                        className="bg-white rounded-full shadow-sm flex items-center pl-4 pr-10 py-2 gap-6"
                    >
                        {/* รูปวงกลมด้านซ้าย */}
                        <div className="w-20 h-20 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                            {course.image && (
                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>

                        {/* ชื่อคอร์ส + คำอธิบาย */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-3xl font-extrabold text-black leading-tight">
                                {course.title}
                            </h2>
                            <p className="text-gray-500 text-sm mt-1 leading-snug">
                                {course.description}
                            </p>
                        </div>

                        {/* ฝั่งขวา: จำนวนข้อ + เวลา + ปุ่ม */}
                        <div className="flex flex-col items-end gap-3 flex-shrink-0 py-2">
                            <div className="text-right text-sm text-gray-700 leading-relaxed">
                                <div>จำนวนข้อ : {course.numQuestions} ข้อ</div>
                                <div>
                                    เวลาในการทำข้อสอบ : {course.duration} นาที
                                </div>
                            </div>
                            <button
                                onClick={() => handleStartQuiz(course.id)}
                                className="bg-[#0a2a4a] hover:bg-[#143b66] text-white text-sm font-medium px-6 py-1 rounded-full transition-colors"
                            >
                                เริ่มทำแบบทดสอบ
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
