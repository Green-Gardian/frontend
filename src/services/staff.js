import { apiFetch } from "@/utils/apiClient";
import { API_BASE_URL } from "@/config/api";


// Get all staff/users based on role and permissions
export const getStaff = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    console.log("params : ", params);

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.role) queryParams.append('role', params.role);
    if (params.search) queryParams.append('search', params.search);
    if (params.societyId) queryParams.append('societyId', params.societyId);

    const url = `${API_BASE_URL}/auth/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await apiFetch(url, { method: "GET" });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch staff");
    }

    return data;
  } catch (error) {
    console.error("Error fetching staff:", error);
    throw error;
  }
};

// Add new staff member
export const addStaff = async (staffData) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/auth/add-admin-and-staff`, {
      method: "POST",
      body: JSON.stringify(staffData),
    });

    const data = await response.json();

    console.log("Add staff response data:", data);

    if (!response.ok) {
     return { error: data.message || "Failed to add staff" };
    }

    return data;
  } catch (error) {
    console.error("Error adding staff:", error);
    throw error;
  }
};

// Block/Unblock user
export const toggleUserBlock = async (userId, isBlocked) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/auth/users/${userId}/block`, {
      method: "PATCH",
      body: JSON.stringify({ isBlocked }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update user status");
    }

    return data;
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
};

// Update user
export const updateUser = async (userId, userData) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update user");
    }

    return data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete user");
    }

    return data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// Get system stats
export const getSystemStats = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/auth/system-stats`, {
      method: "GET",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch system stats");
    }

    return data;
  } catch (error) {
    console.error("Error fetching system stats:", error);
    throw error;
  }
};

// Get available roles based on current user's role
export const getAvailableRoles = (currentUserRole) => {
  if (currentUserRole === 'super_admin') {
    return [
      { value: "admin", label: "Admin" },
      { value: "customer_support", label: "Customer Support" },
      { value: "driver", label: "Driver" },
      { value: "sub_admin", label: "Sub_Admin" },
    ];
  } else if (currentUserRole === 'admin') {
    return [
      { value: "customer_support", label: "Customer Support" },
      { value: "driver", label: "Driver" },
      { value: "sub_admin", label: "Sub_Admin" },
    ];
  }
  else if (currentUserRole === 'sub_admin') {
    return [
      { value: "customer_support", label: "Customer Support" },
      { value: "driver", label: "Driver" },
    ];
  }
  else {
    return [];
  }
};

// Get societies for admin (if needed)
export const getSocieties = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/society/get-societies`, {
      method: "GET",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch societies");
    }

    return data;
  } catch (error) {
    console.error("Error fetching societies:", error);
    throw error;
  }
};
