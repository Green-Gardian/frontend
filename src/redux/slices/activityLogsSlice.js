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
      // Ensure currentPage is included in pagination from request params
      if (res?.pagination && params.page) {
        res.pagination.currentPage = params.page;
      } else if (res?.data?.pagination && params.page) {
        res.data.pagination.currentPage = params.page;
      }
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
        
        // Merge pagination from response, preserving currentPage from request if needed
        const responsePagination = payload?.pagination || payload?.data?.pagination;
        if (responsePagination) {
          state.pagination = {
            ...state.pagination,
            ...responsePagination,
            // Ensure currentPage is set from response or keep existing
            currentPage: responsePagination.currentPage || state.pagination.currentPage || 1,
          };
        }
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


