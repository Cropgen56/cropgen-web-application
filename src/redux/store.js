import { configureStore } from "@reduxjs/toolkit";
import weatherSlice from "./slices/weatherSlice/index";
import authSlice from "./slices/authSlice";
import farmSlice from "./slices/farmSlice";

export const store = configureStore({
  reducer: {
    weather: weatherSlice,
    auth: authSlice,
    farmfield: farmSlice,
  },
});

export default store;
