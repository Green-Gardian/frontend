import { apiFetch } from "@/utils/apiClient";
import { API_BASE_URL } from "@/config/api";

const API_URL = API_BASE_URL;

// Sentiment Analytics Endpoints
export const getSentimentOverview = async (startDate, endDate) => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await apiFetch(
            `${API_URL}/analytics/sentiment/overview?${params}`,
            { method: 'GET' }
        );
        return await response.json();
    } catch (error) {
        console.error('Error fetching sentiment overview:', error);
        throw error;
    }
};

export const getSentimentTrends = async (groupBy = 'week', limit = 12) => {
    try {
        const response = await apiFetch(
            `${API_URL}/analytics/sentiment/trends?groupBy=${groupBy}&limit=${limit}`,
            { method: 'GET' }
        );
        return await response.json();
    } catch (error) {
        console.error('Error fetching sentiment trends:', error);
        throw error;
    }
};

export const getDriverSentiment = async (driverId, startDate, endDate) => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await apiFetch(
            `${API_URL}/analytics/sentiment/drivers/${driverId}?${params}`,
            { method: 'GET' }
        );
        return await response.json();
    } catch (error) {
        console.error('Error fetching driver sentiment:', error);
        throw error;
    }
};

export const getDriverRankings = async (startDate, endDate, minFeedback = 5) => {
    try {
        const params = new URLSearchParams({ minFeedback });
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await apiFetch(
            `${API_URL}/analytics/sentiment/drivers/rankings?${params}`,
            { method: 'GET' }
        );
        return await response.json();
    } catch (error) {
        console.error('Error fetching driver rankings:', error);
        throw error;
    }
};

export const getUrgentFeedback = async (limit = 20, offset = 0) => {
    try {
        const response = await apiFetch(
            `${API_URL}/analytics/sentiment/urgent?limit=${limit}&offset=${offset}`,
            { method: 'GET' }
        );
        return await response.json();
    } catch (error) {
        console.error('Error fetching urgent feedback:', error);
        throw error;
    }
};

export const getSentimentByServiceType = async () => {
    try {
        const response = await apiFetch(
            `${API_URL}/analytics/sentiment/service-types`,
            { method: 'GET' }
        );
        return await response.json();
    } catch (error) {
        console.error('Error fetching sentiment by service type:', error);
        throw error;
    }
};

export const respondToFeedback = async (feedbackId, feedbackResponse) => {
    try {
        const response = await apiFetch(
            `${API_URL}/analytics/sentiment/feedback/${feedbackId}/respond`,
            { method: 'POST', body: JSON.stringify({ response: feedbackResponse }) }
        );
        return await response.json();
    } catch (error) {
        console.error('Error responding to feedback:', error);
        throw error;
    }
};

// System Feedback Endpoints
export const getSystemFeedbackStats = async (startDate, endDate) => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await apiFetch(
            `${API_URL}/feedback/system/stats?${params}`,
            { method: 'GET' }
        );
        return await response.json();
    } catch (error) {
        console.error('Error fetching system feedback stats:', error);
        throw error;
    }
};

export const getAllSystemFeedback = async (filters = {}) => {
    try {
        const params = new URLSearchParams(filters);
        const response = await apiFetch(
            `${API_URL}/feedback/system/all?${params}`,
            { method: 'GET' }
        );
        return await response.json();
    } catch (error) {
        console.error('Error fetching system feedback:', error);
        throw error;
    }
};

export const getSystemFeedbackById = async (feedbackId) => {
    try {
        const response = await apiFetch(
            `${API_URL}/feedback/system/${feedbackId}`,
            { method: 'GET' }
        );
        return await response.json();
    } catch (error) {
        console.error('Error fetching feedback by ID:', error);
        throw error;
    }
};

export const updateSystemFeedbackStatus = async (feedbackId, status, resolutionNotes) => {
    try {
        const response = await apiFetch(
            `${API_URL}/feedback/system/${feedbackId}/status`,
            { method: 'PATCH', body: JSON.stringify({ status, resolutionNotes }) }
        );
        return await response.json();
    } catch (error) {
        console.error('Error updating feedback status:', error);
        throw error;
    }
};

export const respondToSystemFeedback = async (feedbackId, feedbackResponse) => {
    try {
        const response = await apiFetch(
            `${API_URL}/feedback/system/${feedbackId}/respond`,
            { method: 'POST', body: JSON.stringify({ response: feedbackResponse }) }
        );
        return await response.json();
    } catch (error) {
        console.error('Error responding to system feedback:', error);
        throw error;
    }
};
