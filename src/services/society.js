import Cookies from "js-cookie";

const getSocieties = async () => {
  try {
    const token = Cookies.get('access_token');
    
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/society/get-societies`,
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
    console.log("Error fetching societies: ", err.message);
    return { error: "Error while fetching societies!" };
  }
};

const addSociety = async (societyData) => {
  try {
    const token = Cookies.get('access_token');
    
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/society/add-society`,
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(societyData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    return data;
  } catch (err) {
    console.log("Error adding society: ", err.message);
    return { error: "Error while adding society!" };
  }
};

const updateSociety = async (societyId, societyData) => {
  try {
    const token = Cookies.get('access_token');
    
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/society/update-society/${societyId}`,
      {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(societyData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message };
    }

    return data;
  } catch (err) {
    console.log("Error updating society: ", err.message);
    return { error: "Error while updating society!" };
  }
};

const blockSociety = async (societyId) => {
  try {
    const token = Cookies.get('access_token');
    
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/society/block-society/${societyId}`,
      {
        method: "PUT",
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
    console.log("Error blocking society: ", err.message);
    return { error: "Error while blocking society!" };
  }
};

const unblockSociety = async (societyId) => {
  try {
    const token = Cookies.get('access_token');
    
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/society/unblock-society/${societyId}`,
      {
        method: "PUT",
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
    console.log("Error unblocking society: ", err.message);
    return { error: "Error while unblocking society!" };
  }
};

const getSocietyById = async (societyId) => {
  try {
    const token = Cookies.get('access_token');
    
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/society/get-society/${societyId}`,
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
    console.log("Error fetching society: ", err.message);
    return { error: "Error while fetching society!" };
  }
};

export { 
  getSocieties, 
  addSociety, 
  updateSociety, 
  blockSociety, 
  unblockSociety,
  getSocietyById 
};
