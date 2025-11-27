import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getSocieties,
  addSociety,
  updateSociety,
  // deleteSociety,
  getSocietyById,
} from "@/services/society";

/*
  Thunks
*/

export const fetchSocieties = createAsyncThunk(
  "societies/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await getSocieties();
      if (res && res.error) return thunkAPI.rejectWithValue(res.error);

      // API RETURNS { societies: [...] }
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.message || "Failed to fetch societies"
      );
    }
  }
);

export const fetchSocietyById = createAsyncThunk(
  "societies/fetchById",
  async (id, thunkAPI) => {
    try {
      const res = await getSocietyById(id);
      if (res && res.error) return thunkAPI.rejectWithValue(res.error);

      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.message || "Failed to fetch society"
      );
    }
  }
);

export const createSociety = createAsyncThunk(
  "societies/create",
  async (societyData, thunkAPI) => {
    try {
      const res = await addSociety(societyData);
      if (res && res.error) return thunkAPI.rejectWithValue(res.error);

      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.message || "Failed to create society"
      );
    }
  }
);

export const editSociety = createAsyncThunk(
  "societies/edit",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await updateSociety(id, data);
      if (res && res.error) return thunkAPI.rejectWithValue(res.error);

      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.message || "Failed to update society"
      );
    }
  }
);

export const removeSociety = createAsyncThunk(
  "societies/remove",
  async (id, thunkAPI) => {
    try {
      const res = await deleteSociety(id);
      if (res && res.error) return thunkAPI.rejectWithValue(res.error);

      return { id, ...res };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.message || "Failed to delete society"
      );
    }
  }
);

/*
  Slice
*/

const initialState = {
  list: [],       // ALWAYS AN ARRAY
  selected: null,
  loading: false,
  error: null,
};

const societySlice = createSlice({
  name: "societies",
  initialState,
  reducers: {
    clearSelected(state) {
      state.selected = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // FETCH ALL SOCIETIES
    builder
      .addCase(fetchSocieties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSocieties.fulfilled, (state, action) => {
        state.loading = false;

        // IMPORTANT FIX
        state.list = action.payload.societies || [];
      })
      .addCase(fetchSocieties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });

    // FETCH SOCIETY BY ID
    builder
      .addCase(fetchSocietyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSocietyById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload.society || action.payload;
      })
      .addCase(fetchSocietyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });

    // CREATE SOCIETY
    builder
      .addCase(createSociety.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSociety.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.society) {
          state.list.push(action.payload.society);
        } else {
          state.list.push(action.payload);
        }
      })
      .addCase(createSociety.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });

    // EDIT SOCIETY
    builder
      .addCase(editSociety.pending, (state) => {
        state.loading = true;
      })
      .addCase(editSociety.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload.society || action.payload;

        if (updated?.id) {
          state.list = state.list.map((soc) =>
            soc.id === updated.id ? updated : soc
          );
          if (state.selected?.id === updated.id) {
            state.selected = updated;
          }
        }
      })
      .addCase(editSociety.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });

    // DELETE SOCIETY
    builder
      .addCase(removeSociety.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeSociety.fulfilled, (state, action) => {
        state.loading = false;

        const id = action.payload?.id ?? action.meta.arg;

        state.list = state.list.filter((s) => s.id !== id);

        if (state.selected?.id === id) {
          state.selected = null;
        }
      })
      .addCase(removeSociety.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearSelected, clearError } = societySlice.actions;
export default societySlice.reducer;
