import axios from 'axios';
import type { QuizSession, SubmitResponse, QuizSubmitRequest } from '../types/quiz.types';

const API_URL = 'http://localhost:8000/api/v1';

const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return { Authorization: `Bearer ${token}` };
};

export const quizService = {
    startQuiz: async (userId: number, numQuestions: number = 5): Promise<QuizSession> => {
        const headers = getAuthHeaders();
        const response = await axios.post<QuizSession>(
            `${API_URL}/quiz/start`,
            { user_id: userId, num_questions: numQuestions },
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
    }
};
