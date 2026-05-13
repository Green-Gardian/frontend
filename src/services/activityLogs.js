import { apiFetch } from "@/utils/apiClient";
import { API_BASE_URL } from "@/config/api";


// Fetch activity logs (supports page, limit, search, subAdminId, activityType, date range)
export async function getActivityLogs(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        queryParams.append(key, val);
      }
    });

    const response = await apiFetch(
      `${API_BASE_URL}/sub-admin/logs?${queryParams}`,
      { method: "GET" }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || data.message || "Failed to fetch activity logs",
      };
    }

    return data;
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return { error: error.message || "Failed to fetch activity logs" };
  }
}

// Fetch stats for activity logs (total, by type, etc.)
export async function getActivityLogStats(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        queryParams.append(key, val);
      }
    });

    const response = await apiFetch(
      `${API_BASE_URL}/sub-admin/logs/stats?${queryParams}`,
      { method: "GET" }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || data.message || "Failed to fetch activity log stats",
      };
    }

    return data;
  } catch (error) {
    console.error("Error fetching activity log stats:", error);
    return { error: error.message || "Failed to fetch activity log stats" };
  }
}
