export interface Question {
    id: number;
    question_text: string;
    correct_answer: string;
    choices: string[];
    difficulty: number;
    bloom_level: string | null;
    skill_id: string;
}

export interface QuizSession {
    session_id: number;
    questions: Question[];
    total_questions: number;
}

export interface SubmitResponse {
    is_correct: boolean;
    correct_answer: string;
    p_mastery_before: number;
    p_mastery_after: number;
    p_correct_next: number;
}

export interface QuizSubmitRequest {
    user_id: number;
    question_id: number;
    user_answer: string;
    skill_id: string;
}
