import Cookies from "js-cookie";

const getDrivers = async () => {
  const access_token = Cookies.get("access_token");

  try {
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    };

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"}/driver/get-drivers`,
      options
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    return data;
  } catch (err) {
    console.log("Error fetching drivers:", err.message);
    return { error: "Error while fetching drivers!" };
  }
};

const addDriver = async (driverData) => {
  const access_token = Cookies.get("access_token");

  try {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(driverData),
    };

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"}/driver/add-driver`,
      options
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    return data;
  } catch (err) {
    console.log("Error adding driver:", err.message);
    return { error: "Error while adding driver!" };
  }
};

const updateDriver = async (id, driverData) => {
  const access_token = Cookies.get("access_token");

  try {
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(driverData),
    };

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"}/driver/update-driver/${id}`,
      options
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    return data;
  } catch (err) {
    console.log("Error updating driver:", err.message);
    return { error: "Error while updating driver!" };
  }
};

const deleteDriver = async (driverId) => {
  const access_token = Cookies.get("access_token");

  try {
    const options = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    };

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"}/driver/delete-driver/${driverId}`,
      options
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    return data;
  } catch (err) {
    console.log("Error deleting driver:", err.message);
    return { error: "Error while deleting driver!" };
  }
};

const getDriverPerformance = async (driverId, period = '30') => {
  const access_token = Cookies.get("access_token");

  try {
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    };

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"}/driver/${driverId}/performance?period=${period}`,
      options
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    return data;
  } catch (err) {
    console.log("Error fetching driver performance:", err.message);
    return { error: "Error while fetching driver performance!" };
  }
};

const getDriverWorkAreas = async (driverId) => {
  const access_token = Cookies.get("access_token");

  try {
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    };

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"}/driver/work-areas`,
      options
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

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
