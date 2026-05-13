import { apiFetch } from "@/utils/apiClient";
import { API_BASE_URL } from "@/config/api";

const getMessages = async ({ chatId }) => {
  try {
    const response = await apiFetch(
      `${API_BASE_URL}/chat/get-chat-messages/${chatId}`,
      { method: "GET" }
    );
    const data = await response.json();
    if (!response.ok) return { error: data.message };
    return data;
  } catch (err) {
    console.log("Error : ", err.message);
    return "Error while fetching messages!";
  }
};

const getChats = async () => {
  console.log("Fetching chat groups...");
  try {
    const response = await apiFetch(
      `${API_BASE_URL}/chat/get-chat-groups`,
      { method: "GET" }
    );
    const data = await response.json();
    if (!response.ok) return { error: data.message };
    return data;
  } catch (err) {
    console.log("Error : ", err.message);
  }
};

export { getMessages, getChats };