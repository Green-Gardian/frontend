import Cookies from "js-cookie";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Attempts to refresh the access token using the stored refresh token.
 * On success, saves the new access token to cookies and returns it.
 * On failure, clears auth cookies and redirects to /signin.
 * @returns {string|null} The new access token, or null on failure.
 */
const attemptTokenRefresh = async () => {
  const refreshToken = Cookies.get("refresh_token");

  if (!refreshToken) {
    // No refresh token available — force re-login
    clearAuthAndRedirect();
    return null;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      // Refresh token is invalid or expired
      clearAuthAndRedirect();
      return null;
    }

    const data = await response.json();
    const newAccessToken = data.access_token;

    // Save the new access token to cookies
    Cookies.set("access_token", newAccessToken);

    return newAccessToken;
  } catch (err) {
    console.error("Token refresh failed:", err);
    clearAuthAndRedirect();
    return null;
  }
};

/**
 * Clears all auth-related cookies and redirects to the sign-in page.
 */
const clearAuthAndRedirect = () => {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
  Cookies.remove("username");
  Cookies.remove("user_role");
  Cookies.remove("user_society_id");
  Cookies.remove("society");
  window.location.href = "/signin";
};

/**
 * A fetch wrapper for authenticated API calls.
 * Automatically attaches the access token from cookies.
 * If a 401 is received, attempts to silently refresh the token once,
 * then retries the original request. If refresh fails, redirects to /signin.
 *
 * @param {string} url - The URL to fetch (relative path after BACKEND_URL, or full URL).
 * @param {RequestInit} options - Standard fetch options (method, body, headers, etc.)
 * @returns {Promise<Response>} The fetch Response object.
 */
const apiFetch = async (url, options = {}) => {
  const accessToken = Cookies.get("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    // Always override Authorization with the latest token from cookies
    Authorization: `Bearer ${accessToken}`,
  };

  const response = await fetch(url, { ...options, headers });

  // If we got a 401 (Unauthorized), try refreshing the token once
  if (response.status === 401) {
    const newToken = await attemptTokenRefresh();

    if (!newToken) {
      // Refresh failed — clearAuthAndRedirect already called
      return response;
    }

    // Retry the original request with the new access token
    const retryHeaders = {
      ...headers,
      Authorization: `Bearer ${newToken}`,
    };

    return fetch(url, { ...options, headers: retryHeaders });
  }

  return response;
};

export { apiFetch, clearAuthAndRedirect };
