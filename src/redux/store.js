// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";

//reducers from the slices
import alertsReducer from "./slices/alertsSlice";
import authSlice from "./slices/authSlice";
import chatSlice from "./slices/chatSlice";
import customerSlice from "./slices/customerSlice";
import driverSlice from "./slices/driverSlice";
import societyReducer from "./slices/societySlice";
import staffReducer from "./slices/staffSlice";
import vehicleSlice from "./slices/vehicleSlice";

const store = configureStore({
  reducer: {
    // Add your reducers here
    authSlice: authSlice,
    alerts: alertsReducer,
    customer: customerSlice,
    chat: chatSlice,
    driver: driverSlice,
    societies: societyReducer,
    staff: staffReducer,
    vehicles: vehicleSlice,
},
});

export default store;
