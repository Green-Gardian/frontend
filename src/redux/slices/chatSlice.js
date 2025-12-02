
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getMessages as apiGetMessages, getChats as apiGetChats } from "@/services/messages"; 

// Async thunks
export const fetchChats = createAsyncThunk(
  "chat/fetchChats",
  async (_, { rejectWithValue }) => {
    const response = await apiGetChats();
    if (response?.error) return rejectWithValue(response.error);
    return response;
  }
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async ({ chatId }, { rejectWithValue }) => {
    const response = await apiGetMessages({ chatId });
    if (response?.error) return rejectWithValue(response.error);
    return { chatId, messages: response };
  }
);

// Initial state
const initialState = {
  chats: [],
  messages: {}, // store messages per chatId
  loading: false,
  error: null,
};

// Slice
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearChatError(state) {
      state.error = null;
    },
    clearMessages(state, action) {
      const { chatId } = action.payload;
      delete state.messages[chatId];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch chat groups
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { chatId, messages } = action.payload;
        state.messages[chatId] = messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearChatError, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
