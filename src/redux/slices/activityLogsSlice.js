import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getActivityLogs as apiGetActivityLogs,
  getActivityLogStats as apiGetActivityLogStats,
} from "@/services/activityLogs";

// Fetch logs with optional filters & pagination
export const fetchActivityLogs = createAsyncThunk(
  "activityLogs/fetchActivityLogs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await apiGetActivityLogs(params);
      if (res?.error) return rejectWithValue(res.error);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch activity logs");
    }
  }
);

// Fetch stats for cards section
export const fetchActivityLogStats = createAsyncThunk(
  "activityLogs/fetchActivityLogStats",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await apiGetActivityLogStats(params);
      if (res?.error) return rejectWithValue(res.error);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch activity log stats");
    }
  }
);

const initialState = {
  list: [],
  stats: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    totalItems: 0,
  },
  loading: false,
  error: null,
};

const activityLogsSlice = createSlice({
  name: "activityLogs",
  initialState,
  reducers: {
    clearActivityLogsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivityLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        const extractedLogs =
          payload?.logs ||
          payload?.data?.logs ||
          (Array.isArray(payload) ? payload : []);
        state.list = extractedLogs;
        state.pagination =
          payload?.pagination ||
          payload?.data?.pagination ||
          state.pagination;
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchActivityLogStats.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchActivityLogStats.fulfilled, (state, action) => {
        state.stats = action.payload || null;
      })
      .addCase(fetchActivityLogStats.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearActivityLogsError } = activityLogsSlice.actions;
export default activityLogsSlice.reducer;


