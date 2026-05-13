import { apiFetch } from "@/utils/apiClient";
import { API_BASE_URL } from "@/config/api";



const getCustomerAnalytics = async () => {
    try {
        const response = await apiFetch(`${API_BASE_URL}/analytics/customers`, {
            method: "GET",
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch customer analytics");
        }
        return data;
    } catch (error) {
        console.error("Error fetching customer analytics:", error);
        throw error;
    }
}

const getStaffAnalytics = async () => {
    try {
        const response = await apiFetch(`${API_BASE_URL}/analytics/staff`, {
            method: "GET",
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch staff analytics");
        }
        return data;
    } catch (error) {
        console.error("Error fetching staff analytics:", error);
        throw error;
    }
}

const getVehicleAnalytics = async () => {
    try {
        const response = await apiFetch(`${API_BASE_URL}/analytics/vehicles`, {
            method: "GET",
        });
    
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch vehicle analytics");
        }
        return data;
    } catch (error) {
        console.error("Error fetching vehicle analytics:", error);
        throw error;
    }
    
}


export { getCustomerAnalytics, getStaffAnalytics, getVehicleAnalytics };
