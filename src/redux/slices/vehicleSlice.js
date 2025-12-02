// src/redux/vehicleSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getVehicles as apiGetVehicles,
  addVehicle as apiAddVehicle,
  updateVehicle as apiUpdateVehicle,
} from "@/services/vehicle"; // adjust path

// Async thunks
export const fetchVehicles = createAsyncThunk(
  "vehicles/fetchVehicles",
  async (_, { rejectWithValue }) => {
    const response = await apiGetVehicles();
    if (response?.error) return rejectWithValue(response.error);
    return response;
  }
);

export const createVehicle = createAsyncThunk(
  "vehicles/createVehicle",
  async (vehicleData, { rejectWithValue }) => {
    const response = await apiAddVehicle(vehicleData);
    if (response?.error) return rejectWithValue(response.error);
    return response;
  }
);

export const editVehicle = createAsyncThunk(
  "vehicles/editVehicle",
  async ({ id, vehicleData }, { rejectWithValue }) => {
    const response = await apiUpdateVehicle(id, vehicleData);
    if (response?.error) return rejectWithValue(response.error);
    return response;
  }
);

// Initial state
const initialState = {
  vehicles: [],
  loading: false,
  error: null,
};

// Slice
const vehicleSlice = createSlice({
  name: "vehicles",
  initialState,
  reducers: {
    clearVehicleError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Vehicles
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Vehicle
      .addCase(createVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles.push(action.payload);
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Vehicle
      .addCase(editVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editVehicle.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.vehicles.findIndex(v => v.id === action.payload.id);
        if (index !== -1) state.vehicles[index] = action.payload;
      })
      .addCase(editVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Vehicle removed (feature deprecated)
  },
});

export const { clearVehicleError } = vehicleSlice.actions;
export default vehicleSlice.reducer;
