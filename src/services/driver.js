import { apiFetch } from "@/utils/apiClient";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

const getDrivers = async () => {
  try {
    const response = await apiFetch(
      `${BACKEND_URL}/driver/get-drivers`,
      { method: "GET" }
    );
    const data = await response.json();
    if (!response.ok) return { error: data.message };
    return data;
  } catch (err) {
    console.log("Error fetching drivers:", err.message);
    return { error: "Error while fetching drivers!" };
  }
};

const addDriver = async (driverData) => {
  try {
    const response = await apiFetch(
      `${BACKEND_URL}/driver/add-driver`,
      { method: "POST", body: JSON.stringify(driverData) }
    );
    const data = await response.json();
    if (!response.ok) return { error: data.message };
    return data;
  } catch (err) {
    console.log("Error adding driver:", err.message);
    return { error: "Error while adding driver!" };
  }
};

const updateDriver = async (id, driverData) => {
  try {
    const response = await apiFetch(
      `${BACKEND_URL}/driver/update-driver/${id}`,
      { method: "PUT", body: JSON.stringify(driverData) }
    );
    const data = await response.json();
    if (!response.ok) return { error: data.message };
    return data;
  } catch (err) {
    console.log("Error updating driver:", err.message);
    return { error: "Error while updating driver!" };
  }
};

const deleteDriver = async (driverId) => {
  try {
    const response = await apiFetch(
      `${BACKEND_URL}/driver/delete-driver/${driverId}`,
      { method: "DELETE" }
    );
    const data = await response.json();
    if (!response.ok) return { error: data.message };
    return data;
  } catch (err) {
    console.log("Error deleting driver:", err.message);
    return { error: "Error while deleting driver!" };
  }
};

const getDriverPerformance = async (driverId, period = '30') => {
  try {
    const response = await apiFetch(
      `${BACKEND_URL}/driver/${driverId}/performance?period=${period}`,
      { method: "GET" }
    );
    const data = await response.json();
    if (!response.ok) return { error: data.message };
    return data;
  } catch (err) {
    console.log("Error fetching driver performance:", err.message);
    return { error: "Error while fetching driver performance!" };
  }
};

const getDriverWorkAreas = async (driverId) => {
  try {
    const response = await apiFetch(
      `${BACKEND_URL}/driver/work-areas`,
      { method: "GET" }
    );
    const data = await response.json();
    if (!response.ok) return { error: data.message };
    return data;
  } catch (err) {
    console.log("Error fetching driver work areas:", err.message);
    return { error: "Error while fetching driver work areas!" };
  }
};

export {
  getDrivers,
  addDriver,
  updateDriver,
  deleteDriver,
  getDriverPerformance,
  getDriverWorkAreas
};
