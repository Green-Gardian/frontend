import Cookies from "js-cookie";

const signUp = async (credentials) => {
  try {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    };

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/signup`,
      options
    );

    if (!response.ok) {
      throw new Error("Network response was not ok!");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    // Handle error silently
  }
};

const signInFunc = async (credentials) => {
  try {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    };

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/signin`,
      options
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message, requiresMFA: data.requiresMFA };
    }

    return data;
  } catch (err) {
    return { error: "Error while fetching!" };
  }
};

const verifyEmail = async (token, credentials) => {
  try {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    };

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/verify-email?token=${token}`,
      options
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    return data;
  } catch (err) {
    return "Error while fetching!";
  }
};

// Super Admin Functions
const getAllUsers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.role) queryParams.append("role", params.role);
    if (params.search) queryParams.append("search", params.search);

    const token = Cookies.get("access_token");

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/users?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    return data;
  } catch (err) {
    return { error: "Error while fetching users!" };
  }
};

const blockUser = async (userId, isBlocked) => {
  console.log(
    "Block/Unblock user request initiated from frontend for userId:",
    userId,
    " to isBlocked:",
    isBlocked
  );

  try {
    const token = Cookies.get("access_token");

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/users/${userId}/block`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isBlocked }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    } else {
      return { success: true, data: data };
    }

    return data;
  } catch (err) {
    return { error: "Error while blocking user!" };
  }
};

const updateUser = async (userId, userData) => {
  try {
    const token = Cookies.get("access_token");

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/users/${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    return { success: true, data: data };
  } catch (err) {
    console.log("Error updating user: ", err.message);
    return { error: "Error while updating user!" };
  }
};

const deleteUser = async (userId) => {
  try {
    const token = Cookies.get("access_token");

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/users/${userId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    return data;
  } catch (err) {
    return { error: "Error while deleting user!" };
  }
};

const getSystemStats = async () => {
  try {
    const token = Cookies.get("access_token");

    if (!token) {
      return { error: "No access token found" };
    }

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/system-stats`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    return data;
  } catch (err) {
    return { error: "Error while fetching system stats!" };
  }
};

const addAdminAndStaff = async (userData) => {
  try {
    const token = Cookies.get("access_token");

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/add-admin-and-staff`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    return data;
  } catch (err) {
    return { error: "Error while adding admin/staff!" };
  }
};

const forgotPasswordFunc = async (credentials) => {
  try {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    };

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/forgot-password`,
      options
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    return data;
  } catch (err) {
    return { error: "Error while sending reset email!" };
  }
};

const resetPasswordFunc = async (token, credentials) => {
  try {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    };

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/reset-password?token=${token}`,
      options
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    return data;
  } catch (err) {
    return { error: "Error while resetting password!" };
  }
};

const getProfileData = async () => {
  try {
    const token = Cookies.get("access_token");
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/profile`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }
    return data;
  } catch (err) {
    return { error: "Error while fetching profile data!" };
  }
};

const updateProfile = async (payload) => {
  const jsonString = JSON.stringify(payload);
  const sizeInBytes = new TextEncoder().encode(jsonString).length;
  const sizeInKB = sizeInBytes / 1024;

  console.log(`Payload size: ${sizeInBytes} bytes (${sizeInKB.toFixed(2)} KB)`);
  try {
    const token = Cookies.get("access_token");
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        phone_number: payload.phone_number,
        profile_picture: payload.profile_picture,
      }),
    };

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/update-profile`,
      options
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }
    return { data: data, success: true };
  } catch (err) {
    return { error: "Error while updating profile!" };
  }
};

const changePassword = async ({
  currentPassword,
  newPassword,
  confirmNewPassword,
}) => {
  try {
    const token = Cookies.get("access_token");
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmNewPassword,
      }),
    };
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/change-password`,
      options
    );
    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }
    return data;
  } catch (err) {
    return { error: "Error while changing password!" };
  }
};

// MFA Functions
const getMFAStatus = async () => {
  try {
    const token = Cookies.get("access_token");
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/mfa/status`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    return data;
  } catch (err) {
    return { error: "Error while fetching MFA status!" };
  }
};

const generateMFASecret = async () => {
  try {
    const token = Cookies.get("access_token");
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/mfa/generate-secret`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    return data;
  } catch (err) {
    return { error: "Error while generating MFA secret!" };
  }
};

const enableMFA = async (totpCode) => {
  try {
    const token = Cookies.get("access_token");
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/mfa/enable`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ totpCode }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    return data;
  } catch (err) {
    return { error: "Error while enabling MFA!" };
  }
};

const disableMFA = async () => {
  try {
    const token = Cookies.get("access_token");
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/mfa/disable`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    return data;
  } catch (err) {
    return { error: "Error while disabling MFA!" };
  }
};

const verifyMFA = async (email, totpCode) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/mfa/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, totpCode }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    return data;
  } catch (err) {
    return { error: "Error while verifying MFA!" };
  }
};

export {
  signUp,
  signInFunc,
  verifyEmail,
  getAllUsers,
  blockUser,
  updateUser,
  deleteUser,
  getSystemStats,
  addAdminAndStaff,
  forgotPasswordFunc,
  resetPasswordFunc,
  getProfileData,
  updateProfile,
  changePassword,
  getMFAStatus,
  generateMFASecret,
  enableMFA,
  disableMFA,
  verifyMFA,
};
