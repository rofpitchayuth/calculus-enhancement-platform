// src/features/exam/pages/AllCourse.tsx

import { useNavigate } from 'react-router-dom';

interface Course {
    topic: string;        // ตรงกับ main_topic ใน DB
    title: string;
    description: string;
    numQuestions: number;
    duration: number;
}

// Hardcode ตาม main_topic ที่มีใน DB
const courses: Course[] = [
    {
        topic: 'LIMIT',
        title: 'Limit',
        description: 'เรียนรู้แนวคิดลิมิตและความต่อเนื่องของฟังก์ชัน ซึ่งเป็นรากฐานสำคัญของแคลคูลัส',
        numQuestions: 10,
        duration: 60,
    },
    {
        topic: 'DIFFERENTIAL',
        title: 'Differential',
        description: 'เรียนรู้การหาอนุพันธ์เพื่อวัดอัตราการเปลี่ยนแปลง เช่น ความเร็ว ความชัน หรือการเติบโตของฟังก์ชัน',
        numQuestions: 10,
        duration: 60,
    },
    {
        topic: 'INTEGRAL',
        title: 'Integral',
        description: 'เรียนรู้การอินทิเกรตเพื่อหาพื้นที่ใต้กราฟ ปริมาตร และการสะสมของปริมาณต่างๆ',
        numQuestions: 10,
        duration: 60,
    },
    {
        topic: 'APPLICATIONS',
        title: 'Applications',
        description: 'ประยุกต์ใช้แคลคูลัสในการแก้โจทย์ปัญหาจริง เช่น การหาค่าสูงสุด-ต่ำสุด และอัตราการเปลี่ยนแปลง',
        numQuestions: 10,
        duration: 60,
    },
];

export default function AllCourse() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-blue-50 px-4 py-4">
            <h1 className="text-4xl font-extrabold text-[#003B62] mb-6">COURSE</h1>

            <div className="flex flex-col gap-6">
                {courses.map((course) => (
                    <div
                        key={course.topic}
                        className="bg-white rounded-full shadow-sm flex items-center pl-4 pr-10 py-2 gap-6"
                    >
                        {/* รูปวงกลมด้านซ้าย */}
                        <div className="w-20 h-20 rounded-full bg-gray-300 flex-shrink-0" />

                        {/* ชื่อ + คำอธิบาย */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-3xl font-extrabold text-black leading-tight">
                                {course.title}
                            </h2>
                            <p className="text-gray-500 text-sm mt-1 leading-snug">
                                {course.description}
                            </p>
                        </div>

                        {/* ฝั่งขวา: ข้อมูล + ปุ่ม */}
                        <div className="flex flex-col items-end gap-3 flex-shrink-0 py-2">
                            <div className="text-right text-sm text-gray-700 leading-relaxed">
                                <div>จำนวนข้อ : {course.numQuestions} ข้อ</div>
                                <div>เวลาในการทำข้อสอบ : {course.duration} นาที</div>
                            </div>
                            <button
                                onClick={() => navigate(`/quiz/${course.topic}`)}
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
