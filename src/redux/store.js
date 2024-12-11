import { configureStore } from "@reduxjs/toolkit";
import weatherSlice from "./slices/weatherSlice/index";
import authSlice from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    weather: weatherSlice,
    auth: authSlice,
  },
});

export default store;
