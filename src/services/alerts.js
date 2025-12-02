import Cookies from "js-cookie";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

// Helper function to get auth headers
const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${Cookies.get("access_token")}`,
});

// Get all alerts
export const getAlerts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch alerts");
    }

    return data;
  } catch (error) {
    console.error("Error fetching alerts:", error);
    throw error;
  }
};

// Get alert details
export const getAlertDetails = async (alertId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch alert details");
    }

    return data;
  } catch (error) {
    console.error("Error fetching alert details:", error);
    throw error;
  }
};

// Create new alert
export const createAlert = async (alertData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(alertData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create alert");
    }

    return data;
  } catch (error) {
    console.error("Error creating alert:", error);
    throw error;
  }
};

// Update alert
export const updateAlert = async (alertId, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update alert");
    }

    return data;
  } catch (error) {
    console.error("Error updating alert:", error);
    throw error;
  }
};

// Cancel alert
export const cancelAlert = async (alertId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to cancel alert");
    }

    return data;
  } catch (error) {
    console.error("Error cancelling alert:", error);
    throw error;
  }
};

// Get alert statistics
export const getAlertStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/stats`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch alert statistics");
    }

    return data;
  } catch (error) {
    console.error("Error fetching alert statistics:", error);
    throw error;
  }
};

// Get alert types
export const getAlertTypes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/types`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch alert types");
    }

    return data;
  } catch (error) {
    console.error("Error fetching alert types:", error);
    throw error;
  }
};

// Get user notification preferences
export const getUserNotificationPreferences = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/preferences`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch notification preferences");
    }

    return data;
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    throw error;
  }
};

// Update user notification preferences
export const updateUserNotificationPreferences = async (preferences) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/preferences`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(preferences),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update notification preferences");
    }

    return data;
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    throw error;
  }
};

// Register push token
export const registerPushToken = async (tokenData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/push-token`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(tokenData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to register push token");
    }

    return data;
  } catch (error) {
    console.error("Error registering push token:", error);
    throw error;
  }
};

// Get communication logs
export const getCommunicationLogs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/logs`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch communication logs");
    }

    return data;
  } catch (error) {
    console.error("Error fetching communication logs:", error);
    throw error;
  }
};

// Test notification service
export const testNotificationService = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/test-notification`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to test notification service");
    }

    return data;
  } catch (error) {
    console.error("Error testing notification service:", error);
    throw error;
  }
};
