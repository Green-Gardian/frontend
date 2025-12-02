// src/redux/driverSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import {
  getDrivers as apiGetDrivers,
  addDriver as apiAddDriver,
  updateDriver as apiUpdateDriver,
  deleteDriver as apiDeleteDriver,
  getDriverPerformance as apiGetDriverPerformance,
  getDriverWorkAreas as apiGetDriverWorkAreas,
} from "@/services/driver";
// Async thunks
export const fetchDrivers = createAsyncThunk(
  "drivers/fetchDrivers",
  async (_, { rejectWithValue }) => {
    const response = await apiGetDrivers();
    if (response.error) return rejectWithValue(response.error);
    return response;
  }
);

export const createDriver = createAsyncThunk(
  "drivers/createDriver",
  async (driverData, { rejectWithValue }) => {
    const response = await apiAddDriver(driverData);
    if (response.error) return rejectWithValue(response.error);
    return response;
  }
);

export const editDriver = createAsyncThunk(
  "drivers/editDriver",
  async ({ id, driverData }, { rejectWithValue }) => {
    const response = await apiUpdateDriver(id, driverData);
    if (response.error) return rejectWithValue(response.error);
    return response;
  }
);

export const removeDriver = createAsyncThunk(
  "drivers/removeDriver",
  async (driverId, { rejectWithValue }) => {
    const response = await apiDeleteDriver(driverId);
    if (response.error) return rejectWithValue(response.error);
    return driverId; // return id to remove it from the state
  }
);

export const fetchDriverPerformance = createAsyncThunk(
  "drivers/fetchDriverPerformance",
  async ({ driverId, period }, { rejectWithValue }) => {
    const response = await apiGetDriverPerformance(driverId, period);
    if (response.error) return rejectWithValue(response.error);
    return { driverId, performance: response };
  }
);

export const fetchDriverWorkAreas = createAsyncThunk(
  "drivers/fetchDriverWorkAreas",
  async (_, { rejectWithValue }) => {
    const response = await apiGetDriverWorkAreas();
    if (response.error) return rejectWithValue(response.error);
    return response;
  }
);

// Initial state
const initialState = {
  drivers: [],
  workAreas: [],
  performance: {},
  loading: false,
  error: null,
};

// Slice
const driverSlice = createSlice({
  name: "drivers",
  initialState,
  reducers: {
    clearDriverError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Drivers
      .addCase(fetchDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = action.payload;
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Driver
      .addCase(createDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers.push(action.payload);
      })
      .addCase(createDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Driver
      .addCase(editDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editDriver.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.drivers.findIndex(
          (d) => d.id === action.payload.id
        );
        if (index !== -1) state.drivers[index] = action.payload;
      })
      .addCase(editDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Driver
      .addCase(removeDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = state.drivers.filter((d) => d.id !== action.payload);
      })
      .addCase(removeDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Driver Performance
      .addCase(fetchDriverPerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriverPerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.performance[action.payload.driverId] = action.payload.performance;
      })
      .addCase(fetchDriverPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Driver Work Areas
      .addCase(fetchDriverWorkAreas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriverWorkAreas.fulfilled, (state, action) => {
        state.loading = false;
        state.workAreas = action.payload;
      })
      .addCase(fetchDriverWorkAreas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDriverError } = driverSlice.actions;
export default driverSlice.reducer;
