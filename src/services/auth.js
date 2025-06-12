const signUp = async ({ credentials }) => {
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

    return data;
  } catch (err) {
    console.log("Erorr : ", err.message);
    return "Error while fetching!";
  }
};

export { signUp, signInFunc };
