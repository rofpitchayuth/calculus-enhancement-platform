import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1/dashboard';

const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return { Authorization: `Bearer ${token}` };
};

export const dashboardService = {
    getOverviewStats: async () => {
        const response = await axios.get(`${API_URL}/overview`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    getChapterProgress: async () => {
        const response = await axios.get(`${API_URL}/chapter-progress`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    getSkillsRadar: async () => {
        const response = await axios.get(`${API_URL}/skills-radar`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    getRecentAttempts: async () => {
        const response = await axios.get(`${API_URL}/recent-attempts`, {
            headers: getAuthHeaders()
        });
        return response.data;
    }
};

