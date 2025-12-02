import Cookies from "js-cookie";

const getMessages = async ({ chatId }) => {
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
      `${import.meta.env.VITE_BACKEND_URL}/chat/get-chat-messages/${chatId}`,
      options
    );
    const data = await response.json();
    if (!response.ok) {
      return { error: data.message };
    }
    return data;
  } catch (err) {
    console.log("Error : ", err.message);
    return "Error while fetching messages!";
  }
};

const getChats = async () => {


    console.log("Fetching chat groups...");

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
      `${import.meta.env.VITE_BACKEND_URL}/chat/get-chat-groups`,
      options
    );

    const data = await response.json();
    if (!response.ok) {
      return { error: data.message };
    }
    return data;
  } catch (err) {
    console.log("Error : ", err.message);
  }
};


export { getMessages, getChats };