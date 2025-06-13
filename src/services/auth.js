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

export { signUp, signInFunc, verifyEmail };
