import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import trafficReducer from "../features/traffic/trafficSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    traffic: trafficReducer
  }
});