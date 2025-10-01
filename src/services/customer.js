import Cookies from "js-cookie";

export const getUsersBySociety = async () => {
  try {
    const token = Cookies.get("access_token");
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/get-users-by-society`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch users by society");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching users by society:", error);
    throw error;
  }
};

export const addResident = async (residentData) => {
  try {
    const token = Cookies.get("access_token");
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/add-resident`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: residentData.first_name,
          last_name: residentData.last_name,
          phone_number: residentData.phone_number,
          email: residentData.email,
          profile_picture: residentData.profile_picture || "",
        }),
      }
    );

    const data = await response.json();

    console.log("Add resident response data:", data);

    if (!response.ok) {
      return { error: data.message || "Failed to add resident" };
    }
    return {success: true, data};  
  } catch (error) {
    console.error("Error adding resident:", error);
    throw error;
  }
};
