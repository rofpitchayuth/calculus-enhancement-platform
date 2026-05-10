import axios from 'axios';
import type { QuizSession, SubmitResponse, QuizEndResponse, QuizSubmitRequest } from '../types/quiz.types';

import { API_BASE_URL as API_URL } from '../../../shared/api/config';

const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return { Authorization: `Bearer ${token}` };
};

export const quizService = {
    startQuiz: async (userId: number, topic: string, numQuestions: number, difficultyLevel?: string): Promise<QuizSession> => {
        const headers = getAuthHeaders();
        const response = await axios.post<QuizSession>(
            `${API_URL}/quiz/start`,
            {
                user_id:       userId,
                topic:         topic,
                num_questions: numQuestions,
                difficulty_level: difficultyLevel
            },
            { headers }
        );
        return response.data;
    },

    submitAnswer: async (data: QuizSubmitRequest): Promise<SubmitResponse> => {
        const headers = getAuthHeaders();
        const response = await axios.post<SubmitResponse>(
            `${API_URL}/quiz/submit`,
            data,
            { headers }
        );
        return response.data;
    },

    getMastery: async (userId: number, skillId: string): Promise<{ mastery_probability: number }> => {
        const headers = getAuthHeaders();
        const response = await axios.get(
            `${API_URL}/quiz/mastery/${userId}/${skillId}`,
            { headers }
        );
        return response.data;
    },

    endQuizSession: async (userId: number, sessionId: number): Promise<QuizEndResponse> => {
        const headers = getAuthHeaders();
        const response = await axios.post(
            `${API_URL}/quiz/end`,
            { user_id: userId, session_id: sessionId },
            { headers }
        );
        return response.data;
    },

    getAvailableSkillTags: async (): Promise<string[]> => {
        const headers = getAuthHeaders();
        const response = await axios.get<string[]>(
            `${API_URL}/quiz/skill-tags`,
            { headers }
        );
        return response.data;
    }
};
