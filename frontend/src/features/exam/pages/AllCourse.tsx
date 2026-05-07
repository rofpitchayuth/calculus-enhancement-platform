// src/features/exam/pages/AllCourse.tsx

import { useNavigate } from 'react-router-dom';

interface Course {
    topic: string;        // ตรงกับ main_topic ใน DB
    title: string;
    description: string;
    numQuestions: number;
    duration: number;
    subtopics: { id: string; label: string }[];
}

// Hardcode ตาม main_topic ที่มีใน DB
const courses: Course[] = [
    {
        topic: 'LIMIT',
        title: 'Limit',
        description: 'เรียนรู้แนวคิดลิมิตและความต่อเนื่องของฟังก์ชัน ซึ่งเป็นรากฐานสำคัญของแคลคูลัส',
        numQuestions: 10,
        duration: 60,
        subtopics: [
            { id: 'evaluating_limits', label: 'Evaluating Limits' },
            { id: 'limit_laws', label: 'Limit Laws' },
            { id: 'continuity', label: 'Continuity' },
            { id: 'limits_at_infinity', label: 'Limits at Infinity' },
        ],
    },
    {
        topic: 'DIFFERENTIAL',
        title: 'Differential',
        description: 'เรียนรู้การหาอนุพันธ์เพื่อวัดอัตราการเปลี่ยนแปลง เช่น ความเร็ว ความชัน หรือการเติบโตของฟังก์ชัน',
        numQuestions: 10,
        duration: 60,
        subtopics: [
            { id: 'definition_of_derivative', label: 'Definition of Derivative' },
            { id: 'derivative_rules', label: 'Derivative Rules' },
            { id: 'product_rule', label: 'Product Rule' },
            { id: 'chain_rule', label: 'Chain Rule' },
            { id: 'second_derivative', label: 'Second Derivative' },
            { id: 'kinematics', label: 'Kinematics' },
            { id: 'curve_sketching_analysis', label: 'Curve Sketching Analysis' },
        ],
    },
    {
        topic: 'INTEGRAL',
        title: 'Integral',
        description: 'เรียนรู้การอินทิเกรตเพื่อหาพื้นที่ใต้กราฟ ปริมาตร และการสะสมของปริมาณต่างๆ',
        numQuestions: 10,
        duration: 60,
        subtopics: [
            { id: 'indefinite_integrals', label: 'Indefinite Integrals' },
            { id: 'definite_integrals', label: 'Definite Integrals' },
            { id: 'integration_by_parts', label: 'Integration by Parts' },
            { id: 'area_and_volume', label: 'Area and Volume' },
        ],
    },
    {
        topic: 'APPLICATIONS',
        title: 'Applications',
        description: 'ประยุกต์ใช้แคลคูลัสในการแก้โจทย์ปัญหาจริง เช่น การหาค่าสูงสุด-ต่ำสุด และอัตราการเปลี่ยนแปลง',
        numQuestions: 10,
        duration: 60,
        subtopics: [
            { id: 'applications', label: 'General Applications' },
        ],
    },
];

import { useEffect, useState } from 'react';
import { quizService } from '../services/quiz.service';

export default function AllCourse() {
    const navigate = useNavigate();
    const [skillTags, setSkillTags] = useState<string[]>([]);
    const [loadingTags, setLoadingTags] = useState(true);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const tags = await quizService.getAvailableSkillTags();
                setSkillTags(tags);
            } catch (err) {
                console.error("Failed to fetch skill tags", err);
            } finally {
                setLoadingTags(false);
            }
        };
        fetchTags();
    }, []);

    // Helper to capitalize tag names
    const formatTag = (tag: string) => {
        return tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="min-h-screen bg-blue-50 px-4 py-8">
            <h1 className="text-4xl font-extrabold text-[#003B62] mb-8">COURSE</h1>

            {/* Main Topics Section */}
            <div className="flex flex-col gap-6 mb-12">
                {courses.map((course) => (
                    <div
                        key={course.topic}
                        className="bg-white rounded-[2rem] shadow-sm flex items-center pl-6 pr-10 py-4 gap-6 hover:shadow-md transition-shadow"
                    >
                        {/* รูปวงกลมด้านซ้าย */}
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl flex-shrink-0">
                            {course.topic === 'LIMIT' ? '♾️' : 
                             course.topic === 'DIFFERENTIAL' ? '📉' :
                             course.topic === 'INTEGRAL' ? '∫' : '🎯'}
                        </div>

                        {/* ชื่อ + คำอธิบาย + หัวข้อย่อย */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h2 className="text-3xl font-extrabold text-black leading-tight">
                                {course.title}
                            </h2>
                            <p className="text-gray-500 text-sm mt-1 mb-3 leading-snug">
                                {course.description}
                            </p>
                            
                            {/* Subtopics / Skill Tags Selection */}
                            <div className="flex flex-wrap gap-2 mt-1">
                                <span className="text-xs font-semibold text-gray-400 mr-1 self-center">ฝึกฝนเฉพาะหัวข้อ:</span>
                                {course.subtopics.map(sub => (
                                    <button
                                        key={sub.id}
                                        onClick={() => navigate(`/quiz/${sub.id}`)}
                                        className="bg-white hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-200 text-xs font-semibold px-4 py-1 rounded-full transition-all"
                                    >
                                        {sub.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ฝั่งขวา: ข้อมูล + ปุ่ม (Main Topic) */}
                        <div className="flex flex-col items-end gap-3 flex-shrink-0 py-2">
                            <div className="text-right text-sm text-gray-700 leading-relaxed font-medium">
                                <div>{course.numQuestions} Questions</div>
                                <div>{course.duration} Minutes</div>
                            </div>
                            <button
                                onClick={() => navigate(`/quiz/${course.topic}`)}
                                className="bg-[#0a2a4a] hover:bg-[#143b66] text-white text-sm font-bold px-8 py-2 rounded-full transition-all shadow-lg active:scale-95"
                            >
                                สุ่มทำแบบทดสอบทั้งบท
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dynamic Skill Tags Section (Fetched from DB) */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-blue-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-xl">🏷️</div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">ฝึกตามทักษะ (Skill Tags จากระบบ)</h2>
                        <p className="text-gray-500 text-sm">เลือกทำโจทย์ที่เน้นเฉพาะทักษะ (ดึงข้อมูลแบบ Real-time จากฐานข้อมูล)</p>
                    </div>
                </div>

                {loadingTags ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
                    </div>
                ) : skillTags.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                        {skillTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => navigate(`/quiz/${tag}`)}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all group"
                            >
                                <span className="text-sm font-bold text-gray-700 group-hover:text-yellow-700">{formatTag(tag)}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        ยังไม่มี Skill Tags ในระบบ
                    </div>
                )}
                
                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-xs text-gray-400">
                        * ระบบจะสุ่มข้อสอบที่มีป้ายกำกับทักษะเหล่านี้มาให้คุณฝึกฝน
                    </p>
                </div>
            </div>
        </div>
    );
}
