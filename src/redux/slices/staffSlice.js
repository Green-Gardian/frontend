import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getStaff,
  addStaff,
  toggleUserBlock,
  updateUser,
  deleteUser,
  getSystemStats,
  getSocieties, 
} from "@/services/staff";


// Fetch staff list (with filters: page, limit, role, search, society)
export const fetchStaff = createAsyncThunk(
  "staff/fetchStaff",
  async (params, thunkAPI) => {
    try {

      console.log("params", params);

      const res = await getStaff(params);
      
      console.log("res", res);
      if (res?.error) return thunkAPI.rejectWithValue(res.error);
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || "Failed to fetch staff");
    }
  }
);

// Add staff
export const createStaff = createAsyncThunk(
  "staff/createStaff",
  async (data, thunkAPI) => {
    try {

      

      const res = await addStaff(data);
      if (res?.error) return thunkAPI.rejectWithValue(res.error);
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || "Failed to add staff");
    }
  }
);

// Block / Unblock user
export const toggleBlockStatus = createAsyncThunk(
  "staff/toggleBlockStatus",
  async ({ userId, isBlocked }, thunkAPI) => {
    try {
      const res = await toggleUserBlock(userId, isBlocked);
      return { ...res, userId, isBlocked };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || "Failed to update user");
    }
  }
);

// Update user
export const editUser = createAsyncThunk(
  "staff/editUser",
  async ({ userId, data }, thunkAPI) => {
    try {
      const res = await updateUser(userId, data);
      if (res?.error) return thunkAPI.rejectWithValue(res.error);
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || "Failed to update user");
    }
  }
);

// Delete user
export const removeUser = createAsyncThunk(
  "staff/removeUser",
  async (userId, thunkAPI) => {
    try {
      const res = await deleteUser(userId);
      return { ...res, userId };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || "Failed to delete user");
    }
  }
);

// System Stats
export const fetchSystemStats = createAsyncThunk(
  "staff/systemStats",
  async (_, thunkAPI) => {
    try {
      const res = await getSystemStats();
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.message || "Failed to fetch system stats"
      );
    }
  }
);

// Societies list (optional: if needed for filter dropdown)
export const fetchSocietiesForStaff = createAsyncThunk(
  "staff/fetchSocieties",
  async (_, thunkAPI) => {
    try {
      const res = await getSocieties();
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.message || "Failed to fetch societies"
      );
    }
  }
);

// ---------------- Slice ---------------- //

const staffSlice = createSlice({
  name: "staff",
  initialState: {
    list: [],
    stats: null,
    societies: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      limit: 7,
      totalUsers: 0,
    },
    loading: false,
    error: null,
  },

  reducers: {
    clearStaffError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch Staff
      .addCase(fetchStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        const extractedUsers =
          payload?.users ||
          payload?.data?.users ||
          (Array.isArray(payload) ? payload : []);
        state.list = extractedUsers;
        state.pagination =
          payload?.pagination ||
          payload?.data?.pagination ||
          state.pagination;
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Staff
      .addCase(createStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) state.list.push(action.payload.user);
      })
      .addCase(createStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle Block
      .addCase(toggleBlockStatus.fulfilled, (state, action) => {
        const { userId, isBlocked } = action.payload;
        state.list = state.list.map((u) =>
          u.id === userId ? { ...u, isBlocked } : u
        );
      })

      // Edit User
      .addCase(editUser.fulfilled, (state, action) => {
        const updated = action.payload;
        state.list = state.list.map((u) => (u.id === updated.id ? updated : u));
      })

      // Delete User
      .addCase(removeUser.fulfilled, (state, action) => {
        const id = action.payload.userId;
        state.list = state.list.filter((u) => u.id !== id);
      })

      // System Stats
      .addCase(fetchSystemStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      // Societies
      .addCase(fetchSocietiesForStaff.fulfilled, (state, action) => {
        state.societies = action.payload;
      });
  },
});

export const { clearStaffError } = staffSlice.actions;
export default staffSlice.reducer;
