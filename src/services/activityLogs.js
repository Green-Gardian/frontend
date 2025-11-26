import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

function getAuthHeaders() {
  const token = Cookies.get("access_token");
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

// Fetch activity logs (supports page, limit, search, subAdminId, activityType, date range)
export async function getActivityLogs(params = {}) {
  try {
    const response = await axios.get(`${API_BASE_URL}/sub-admin/logs`, {
      params,
      headers: {
        ...getAuthHeaders(),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return {
      error:
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch activity logs",
    };
  }
}

// Fetch stats for activity logs (total, by type, etc.)
export async function getActivityLogStats(params = {}) {
  try {
    const response = await axios.get(`${API_BASE_URL}/sub-admin/logs/stats`, {
      params,
      headers: {
        ...getAuthHeaders(),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching activity log stats:", error);
    return {
      error:
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch activity log stats",
    };
  }
}


