import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Card } from "../../../shared/components/ui/Card";

interface SkillMasteryChartProps {
    knowledge: Record<string, number>;
}

export function SkillMasteryChart({ knowledge }: SkillMasteryChartProps) {
    const data = Object.entries(knowledge).map(([skill, mastery]) => ({
        subject: skill,
        A: Math.round(mastery * 100),
        fullMark: 100,
    }));

    return (
        <Card className="p-6 shadow-lg h-full flex flex-col">
            <h3 className="text-xl font-bold text-gray-800 mb-6">ความชำนาญรายบท</h3>
            <div className="flex-1 w-full min-h-[300px]">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} />
                            <YAxis dataKey="subject" type="category" width={100} />
                            <Tooltip formatter={(value) => [`${value}%`, "ความชำนาญ"]} />
                            <Bar dataKey="A" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        ยังไม่มีข้อมูลการทำแบบทดสอบ
                    </div>
                )}
            </div>
        </Card>
    );
}
