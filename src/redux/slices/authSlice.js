import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  signUp,
  signInFunc,
  verifyEmail,
  getAllUsers,
  blockUser,
  deleteUser,
  getSystemStats,
  addAdminAndStaff,
  forgotPasswordFunc,
  resetPasswordFunc,
  getProfileData,
  updateProfile,
  changePassword,
} from "@/services/auth";

import Cookies from "js-cookie";

export const signUpUser = createAsyncThunk(
  "auth/signUpUser",
  async (credentials, thunkAPI) => {
    try {
      return await signUp(credentials);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const signInUser = createAsyncThunk(
  "auth/signInUser",
  async (credentials, thunkAPI) => {
    try {
      const res = await signInFunc(credentials);

      if (res.error) return thunkAPI.rejectWithValue(res.error);

      // Save token
      Cookies.set("access_token", res.token);

      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue("Login failed");
    }
  }
);

export const verifyUserEmail = createAsyncThunk(
  "auth/verifyEmail",
  async ({ token, credentials }, thunkAPI) => {
    try {
      return await verifyEmail(token, credentials);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, thunkAPI) => {
    try {
      const res = await getProfileData();

      if (res.error) return thunkAPI.rejectWithValue(res.error);

      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue("Could not get profile");
    }
  }
);
export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (payload, thunkAPI) => {
    try {
      const res = await updateProfile(payload);

      if (res.error) return thunkAPI.rejectWithValue(res.error);

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue("Update failed");
    }
  }
);

export const changeUserPassword = createAsyncThunk(
  "auth/changeUserPassword",
  async (payload, thunkAPI) => {
    try {
      const res = await changePassword(payload);
      if (res.error) return thunkAPI.rejectWithValue(res.error);

      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue("Password update failed");
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (credentials, thunkAPI) => {
    try {
      const res = await forgotPasswordFunc(credentials);
      if (res.error) return thunkAPI.rejectWithValue(res.error);

      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to send reset mail");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, data }, thunkAPI) => {
    try {
      const res = await resetPasswordFunc(token, data);
      if (res.error) return thunkAPI.rejectWithValue(res.error);

      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue("Reset failed");
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  "auth/fetchAllUsers",
  async (params, thunkAPI) => {
    try {
      const res = await getAllUsers(params);
      if (res.error) return thunkAPI.rejectWithValue(res.error);

      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to load users");
    }
  }
);

export const toggleBlockUser = createAsyncThunk(
  "auth/toggleBlockUser",
  async ({ userId, isBlocked }, thunkAPI) => {
    try {
      const res = await blockUser(userId, isBlocked);
      if (res.error) return thunkAPI.rejectWithValue(res.error);

      return { userId, isBlocked };
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to update block state");
    }
  }
);

export const deleteUserAccount = createAsyncThunk(
  "auth/deleteUserAccount",
  async (userId, thunkAPI) => {
    try {
      const res = await deleteUser(userId);
      if (res.error) return thunkAPI.rejectWithValue(res.error);

      return userId;
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to delete user");
    }
  }
);

export const fetchSystemStats = createAsyncThunk(
  "auth/fetchSystemStats",
  async (_, thunkAPI) => {
    try {
      const res = await getSystemStats();
      if (res.error) return thunkAPI.rejectWithValue(res.error);

      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to load stats");
    }
  }
);

export const addAdminStaff = createAsyncThunk(
  "auth/addAdminStaff",
  async (payload, thunkAPI) => {
    try {
      const res = await addAdminAndStaff(payload);
      if (res.error) return thunkAPI.rejectWithValue(res.error);

      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to add admin/staff");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: Cookies.get("access_token") || null,

    users: [], // super admin
    stats: null,

    loading: false,
    error: null,
  },

  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      Cookies.remove("access_token");
    },
  },

  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(signInUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // PROFILE
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })

      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload; // updated profile
      })

      // SUPER ADMIN — USERS LIST
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.users = action.payload.users || [];
      })

      // SUPER ADMIN — BLOCK USER
      .addCase(toggleBlockUser.fulfilled, (state, action) => {
        const { userId, isBlocked } = action.payload;
        const user = state.users.find((u) => u._id === userId);
        if (user) user.isBlocked = isBlocked;
      })

      // SUPER ADMIN — DELETE USER
      .addCase(deleteUserAccount.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      })

      // SYSTEM STATS
      .addCase(fetchSystemStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
