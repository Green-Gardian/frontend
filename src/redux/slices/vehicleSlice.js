// src/redux/vehicleSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getVehicles as apiGetVehicles,
  addVehicle as apiAddVehicle,
  updateVehicle as apiUpdateVehicle,
  deleteVehicle as apiDeleteVehicle,
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

export const removeVehicle = createAsyncThunk(
  "vehicles/removeVehicle",
  async (vehicleId, { rejectWithValue }) => {
    const response = await apiDeleteVehicle(vehicleId);
    if (response?.error) return rejectWithValue(response.error);
    return vehicleId; // return id to remove from state
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

      // Delete Vehicle
      .addCase(removeVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = state.vehicles.filter(v => v.id !== action.payload);
      })
      .addCase(removeVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearVehicleError } = vehicleSlice.actions;
export default vehicleSlice.reducer;
