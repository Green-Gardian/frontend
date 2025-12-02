import Cookies from "js-cookie";

const getVehicles = async () => {
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
      `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"}/vehicle/get-vehicles/`,
      options
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    return data;
  } catch (err) {
    console.log("Error : ", err.message);
    return "Error while fetching vehicles!";
  }
};

const addVehicle = async (vehicleData) => {
  console.log(" add vehicle function!");

  console.log("vehicle data : ", vehicleData);
  const access_token = Cookies.get("access_token");

  try {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(vehicleData),
    };

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"}/vehicle/add-vehicle/`,
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

const updateVehicle = async (id, vehicleData) => {
  const access_token = Cookies.get("access_token");

  try {
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(vehicleData),
    };

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"}/vehicle/update-vehicle/${id}/`,
      options
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    console.log("data : ", data);

    return data;
  } catch (err) {
    console.log("Error : ", err.message);
    return "Error while updating vehicle!";
  }
};

export { getVehicles, addVehicle, updateVehicle };
