import { apiFetch } from "@/utils/apiClient";
import { API_BASE_URL } from "@/config/api";

const BASE_URL = API_BASE_URL;

// Add a new vehicle to inventory (Super Admin only)
export const addVehicleToInventory = async (vehicleData) => {
    try {
        const response = await apiFetch(`${BASE_URL}/super-admin/vehicle/add-to-inventory`, {
            method: "POST",
            body: JSON.stringify(vehicleData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to add vehicle to inventory");
        }

        return data;
    } catch (error) {
        console.error("Error adding vehicle to inventory:", error);
        throw error;
    }
};

// Get all vehicles in inventory (Super Admin only)
export const getVehicleInventory = async () => {
    try {
        const response = await apiFetch(`${BASE_URL}/super-admin/vehicle/inventory`, {
            method: "GET",
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch vehicle inventory");
        }

        return data;
    } catch (error) {
        console.error("Error fetching vehicle inventory:", error);
        throw error;
    }
};

// Update vehicle in inventory (Super Admin only)
export const updateVehicleInventory = async (vehicleId, vehicleData) => {
    try {
        const response = await apiFetch(
            `${BASE_URL}/super-admin/vehicle/inventory/${vehicleId}`,
            {
                method: "PUT",
                body: JSON.stringify(vehicleData),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to update vehicle");
        }

        return data;
    } catch (error) {
        console.error("Error updating vehicle:", error);
        throw error;
    }
};

// Block a vehicle (Super Admin only)
export const blockVehicle = async (vehicleId, blockData) => {
    try {
        const response = await apiFetch(
            `${BASE_URL}/super-admin/vehicle/block/${vehicleId}`,
            {
                method: "PUT",
                body: JSON.stringify(blockData),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to block vehicle");
        }

        return data;
    } catch (error) {
        console.error("Error blocking vehicle:", error);
        throw error;
    }
};

// Unblock a vehicle (Super Admin only)
export const unblockVehicle = async (vehicleId, statusData) => {
    try {
        const response = await apiFetch(
            `${BASE_URL}/super-admin/vehicle/unblock/${vehicleId}`,
            {
                method: "PUT",
                body: JSON.stringify(statusData),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to unblock vehicle");
        }

        return data;
    } catch (error) {
        console.error("Error unblocking vehicle:", error);
        throw error;
    }
};

// Get available vehicles for assignment (Admin and Super Admin)
export const getAvailableVehicles = async () => {
    try {
        const response = await apiFetch(`${BASE_URL}/super-admin/vehicle/available`, {
            method: "GET",
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch available vehicles");
        }

        return data;
    } catch (error) {
        console.error("Error fetching available vehicles:", error);
        throw error;
    }
};
