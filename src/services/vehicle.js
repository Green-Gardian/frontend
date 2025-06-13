import Cookies from 'js-cookie';

const addVehicle = async (vehicleData) => {
  console.log(" add vehicle function!");

  console.log("vehicle data : ", vehicleData);

  vehicleData = {
    plateNo: "ABC-123",
    driverName: "driver_1",
    status: "active",
  };

  console.log("vehicle data : ", vehicleData);

  console.log('access_token : ',Cookies.get('access_token'))

  try {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" ,
        Authorization:`Bearer ${Cookies.get('access_tokens')}`
      },
      body: JSON.stringify(vehicleData),
    };

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/vehicle/add-vehicle`,
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

export { addVehicle };
