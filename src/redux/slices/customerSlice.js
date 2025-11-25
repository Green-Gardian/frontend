import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUsersBySociety, addResident } from "@/services/customer";

// Fetch all residents under society
export const fetchSocietyUsers = createAsyncThunk(
  "customers/fetchSocietyUsers",
  async (_, thunkAPI) => {
    try {
      const response = await getUsersBySociety();
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Add a new resident
export const addNewResident = createAsyncThunk(
  "customers/addNewResident",
  async (residentData, thunkAPI) => {
    try {
      const response = await addResident(residentData);
      if (response.error) {
        return thunkAPI.rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// ------------------------------
// Slice
// ------------------------------
const customerSlice = createSlice({
  name: "customers",
  initialState: {
    users: [],
    loading: false,
    error: null,
    addedResident: null,
  },

  reducers: {
    clearCustomerError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ============ FETCH USERS ============
      .addCase(fetchSocietyUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSocietyUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || action.payload.data || [];
      })
      .addCase(fetchSocietyUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch society users";
      })

      // ============ ADD RESIDENT ============
      .addCase(addNewResident.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNewResident.fulfilled, (state, action) => {
        state.loading = false;
        state.addedResident = action.payload;
        state.users.push(action.payload); // auto-add to list
      })
      .addCase(addNewResident.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add resident";
      });
  },
});

export const { clearCustomerError } = customerSlice.actions;
export default customerSlice.reducer;
