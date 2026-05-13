export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
export const SOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_BACKEND_URL is not defined in the frontend environment.");
}
