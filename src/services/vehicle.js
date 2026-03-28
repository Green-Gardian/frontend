import { apiFetch } from "@/utils/apiClient";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

const getVehicles = async () => {
  try {
    const response = await apiFetch(
      `${BACKEND_URL}/vehicle/get-vehicles/`,
      { method: "GET" }
    );
    const data = await response.json();
    if (!response.ok) return { error: data.message };
    return data;
  } catch (err) {
    console.log("Error : ", err.message);
    return "Error while fetching vehicles!";
  }
};

const addVehicle = async (vehicleData) => {
  console.log(" add vehicle function!");
  console.log("vehicle data : ", vehicleData);
  try {
    const response = await apiFetch(
      `${BACKEND_URL}/vehicle/add-vehicle/`,
      { method: "POST", body: JSON.stringify(vehicleData) }
    );
    const data = await response.json();
    if (!response.ok) return { error: data.message };
    console.log("data : ", data);
    return data;
  } catch (err) {
    console.log("Erorr : ", err.message);
    return "Error while fetching!";
  }
};

const updateVehicle = async (id, vehicleData) => {
  try {
    const response = await apiFetch(
      `${BACKEND_URL}/vehicle/update-vehicle/${id}/`,
      { method: "PUT", body: JSON.stringify(vehicleData) }
    );
    const data = await response.json();
    if (!response.ok) return { error: data.message };
    console.log("data : ", data);
    return data;
  } catch (err) {
    console.log("Error : ", err.message);
    return "Error while updating vehicle!";
  }
};

export { getVehicles, addVehicle, updateVehicle };
