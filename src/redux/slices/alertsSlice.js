import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAlerts,
  getAlertDetails,
  createAlert,
  updateAlert,
  cancelAlert,
  getAlertStats,
  getAlertTypes,
  getUserNotificationPreferences,
  updateUserNotificationPreferences,
  registerPushToken,
  getCommunicationLogs,
  testNotificationService,
} from "@/services/alerts"; 

// Fetch all alerts
export const fetchAlerts = createAsyncThunk(
  "alerts/fetchAlerts",
  async (_, thunkAPI) => {
    try {
      return await getAlerts();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Fetch alert details
export const fetchAlertDetails = createAsyncThunk(
  "alerts/fetchAlertDetails",
  async (alertId, thunkAPI) => {
    try {
      return await getAlertDetails(alertId);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Create new alert
export const createNewAlert = createAsyncThunk(
  "alerts/createNewAlert",
  async (alertData, thunkAPI) => {
    try {
      return await createAlert(alertData);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Update alert
export const updateExistingAlert = createAsyncThunk(
  "alerts/updateExistingAlert",
  async ({ alertId, updateData }, thunkAPI) => {
    try {
      return await updateAlert(alertId, updateData);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Cancel alert
export const cancelExistingAlert = createAsyncThunk(
  "alerts/cancelExistingAlert",
  async (alertId, thunkAPI) => {
    try {
      return await cancelAlert(alertId);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Stats
export const fetchAlertStats = createAsyncThunk(
  "alerts/fetchAlertStats",
  async (_, thunkAPI) => {
    try {
      return await getAlertStats();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Types
export const fetchAlertTypes = createAsyncThunk(
  "alerts/fetchAlertTypes",
  async (_, thunkAPI) => {
    try {
      return await getAlertTypes();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Preferences
export const fetchNotificationPreferences = createAsyncThunk(
  "alerts/fetchNotificationPreferences",
  async (_, thunkAPI) => {
    try {
      return await getUserNotificationPreferences();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const updateNotificationPreferences = createAsyncThunk(
  "alerts/updateNotificationPreferences",
  async (prefs, thunkAPI) => {
    try {
      return await updateUserNotificationPreferences(prefs);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Push Token
export const registerToken = createAsyncThunk(
  "alerts/registerToken",
  async (tokenData, thunkAPI) => {
    try {
      return await registerPushToken(tokenData);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Logs
export const fetchCommunicationLogs = createAsyncThunk(
  "alerts/fetchCommunicationLogs",
  async (_, thunkAPI) => {
    try {
      return await getCommunicationLogs();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Test notification
export const testNotification = createAsyncThunk(
  "alerts/testNotification",
  async (_, thunkAPI) => {
    try {
      return await testNotificationService();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);


const alertsSlice = createSlice({
  name: "alerts",
  initialState: {
    list: [],
    stats: null,
    types: null,
    logs: [],
    preferences: null,
    selectedAlert: null,
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder

      // Alerts list
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Alert details
      .addCase(fetchAlertDetails.fulfilled, (state, action) => {
        state.selectedAlert = action.payload;
      })

      // Stats
      .addCase(fetchAlertStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      // Types
      .addCase(fetchAlertTypes.fulfilled, (state, action) => {
        state.types = action.payload;
      })

      // Preferences
      .addCase(fetchNotificationPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
      })

      .addCase(updateNotificationPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
      })

      // Logs
      .addCase(fetchCommunicationLogs.fulfilled, (state, action) => {
        state.logs = action.payload;
      });
  },
});

export default alertsSlice.reducer;


