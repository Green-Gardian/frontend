import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Create axios instance with auth
const getAuthHeaders = () => {
    const token = Cookies.get('access_token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

// Sentiment Analytics Endpoints
export const getSentimentOverview = async (startDate, endDate) => {
    try {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await axios.get(`${API_URL}/analytics/sentiment/overview`, {
            ...getAuthHeaders(),
            params
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching sentiment overview:', error);
        throw error;
    }
};

export const getSentimentTrends = async (groupBy = 'week', limit = 12) => {
    try {
        const response = await axios.get(`${API_URL}/analytics/sentiment/trends`, {
            ...getAuthHeaders(),
            params: { groupBy, limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching sentiment trends:', error);
        throw error;
    }
};

export const getDriverSentiment = async (driverId, startDate, endDate) => {
    try {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await axios.get(`${API_URL}/analytics/sentiment/drivers/${driverId}`, {
            ...getAuthHeaders(),
            params
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching driver sentiment:', error);
        throw error;
    }
};

export const getDriverRankings = async (startDate, endDate, minFeedback = 5) => {
    try {
        const params = { minFeedback };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await axios.get(`${API_URL}/analytics/sentiment/drivers/rankings`, {
            ...getAuthHeaders(),
            params
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching driver rankings:', error);
        throw error;
    }
};

export const getUrgentFeedback = async (limit = 20, offset = 0) => {
    try {
        const response = await axios.get(`${API_URL}/analytics/sentiment/urgent`, {
            ...getAuthHeaders(),
            params: { limit, offset }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching urgent feedback:', error);
        throw error;
    }
};

export const getSentimentByServiceType = async () => {
    try {
        const response = await axios.get(`${API_URL}/analytics/sentiment/service-types`, {
            ...getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching sentiment by service type:', error);
        throw error;
    }
};

export const respondToFeedback = async (feedbackId, response) => {
    try {
        const result = await axios.post(
            `${API_URL}/analytics/sentiment/feedback/${feedbackId}/respond`,
            { response },
            getAuthHeaders()
        );
        return result.data;
    } catch (error) {
        console.error('Error responding to feedback:', error);
        throw error;
    }
};

// System Feedback Endpoints
export const getSystemFeedbackStats = async (startDate, endDate) => {
    try {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await axios.get(`${API_URL}/feedback/system/stats`, {
            ...getAuthHeaders(),
            params
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching system feedback stats:', error);
        throw error;
    }
};

export const getAllSystemFeedback = async (filters = {}) => {
    try {
        const response = await axios.get(`${API_URL}/feedback/system/all`, {
            ...getAuthHeaders(),
            params: filters
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching system feedback:', error);
        throw error;
    }
};

export const getSystemFeedbackById = async (feedbackId) => {
    try {
        const response = await axios.get(`${API_URL}/feedback/system/${feedbackId}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error fetching feedback by ID:', error);
        throw error;
    }
};

export const updateSystemFeedbackStatus = async (feedbackId, status, resolutionNotes) => {
    try {
        const response = await axios.patch(
            `${API_URL}/feedback/system/${feedbackId}/status`,
            { status, resolutionNotes },
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Error updating feedback status:', error);
        throw error;
    }
};

export const respondToSystemFeedback = async (feedbackId, response) => {
    try {
        const result = await axios.post(
            `${API_URL}/feedback/system/${feedbackId}/respond`,
            { response },
            getAuthHeaders()
        );
        return result.data;
    } catch (error) {
        console.error('Error responding to system feedback:', error);
        throw error;
    }
};
