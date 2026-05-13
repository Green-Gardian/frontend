import Cookies from "js-cookie";
import { API_BASE_URL } from "@/config/api";


const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${Cookies.get("access_token")}`,
});

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      query.set(key, String(value));
    }
  });
  return query.toString();
};

export const getDuesOverview = async ({ month } = {}) => {
  const query = buildQuery({ month });
  const response = await fetch(`${API_BASE_URL}/services/admin/dues/overview${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch dues overview");
  }
  return data;
};

export const getDuesRecords = async ({ page = 1, limit = 10, month, status, search } = {}) => {
  const query = buildQuery({ page, limit, month, status, search });
  const response = await fetch(`${API_BASE_URL}/services/admin/dues/records?${query}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch dues records");
  }
  return data;
};

export const getResidentDuesHistory = async (residentId) => {
  const response = await fetch(`${API_BASE_URL}/services/admin/dues/resident/${residentId}/history`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch resident dues history");
  }
  return data;
};
