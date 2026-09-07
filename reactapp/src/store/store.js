import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import complaintReducer from "./slices/complaintSlice";
import uiReducer from "./slices/uiSlice";
import notificationReducer from "./slices/notificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    complaints: complaintReducer,
    ui: uiReducer,
    notifications: notificationReducer
  },
  devTools: process.env.NODE_ENV !== "production"
});

export default store;
