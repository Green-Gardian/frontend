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
    console.log("Erorr : ", err.message);
  }
};

const signInFunc = async (credentials) => {
  console.log("signin function!");

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
      return { error: data.message };
    }

    console.log("data : ", data);

    return data;
  } catch (err) {
    console.log("Erorr : ", err.message);
    return "Error while fetching!";
  }
};

const verifyEmail = async (token,credentials) => {
  console.log("verify email function!");

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

    console.log("data : ", data);

    return data;
  } catch (err) {
    console.log("Erorr : ", err.message);
    return "Error while fetching!";
  }
};

// Super Admin Functions
const getAllUsers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.role) queryParams.append('role', params.role);
    if (params.search) queryParams.append('search', params.search);

    const token = Cookies.get('access_token');
    
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/users?${queryParams}`,
      {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    return data;
  } catch (err) {
    console.log("Error fetching users: ", err.message);
    return { error: "Error while fetching users!" };
  }
};

const blockUser = async (userId, isBlocked) => {
  try {
    const token = Cookies.get('access_token');
    
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/users/${userId}/block`,
      {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ isBlocked }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    return data;
  } catch (err) {
    console.log("Error blocking user: ", err.message);
    return { error: "Error while blocking user!" };
  }
};

const deleteUser = async (userId) => {
  try {
    const token = Cookies.get('access_token');
    
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/users/${userId}`,
      {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    return data;
  } catch (err) {
    console.log("Error deleting user: ", err.message);
    return { error: "Error while deleting user!" };
  }
};

const getSystemStats = async () => {
  try {
    const token = Cookies.get('access_token');
    console.log("Token from cookies:", token);
    
    if (!token) {
      return { error: "No access token found" };
    }
    
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/system-stats`,
      {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      }
    );

    const data = await response.json();
    console.log("System stats response:", data);

    if (!response.ok) {
      return { error: data.message };
    }

    return data;
  } catch (err) {
    console.log("Error fetching system stats: ", err.message);
    return { error: "Error while fetching system stats!" };
  }
};

const addAdminAndStaff = async (userData) => {
  try {
    const token = Cookies.get('access_token');
    
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/add-admin-and-staff`,
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
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
    console.log("Error adding admin/staff: ", err.message);
    return { error: "Error while adding admin/staff!" };
  }
};

export { 
  signUp, 
  signInFunc, 
  verifyEmail, 
  getAllUsers, 
  blockUser, 
  deleteUser, 
  getSystemStats,
  addAdminAndStaff 
};
