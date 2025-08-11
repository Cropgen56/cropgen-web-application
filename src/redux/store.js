import { configureStore } from "@reduxjs/toolkit";
import weatherSlice from "./slices/weatherSlice";
import authSlice from "./slices/authSlice";
import farmSlice from "./slices/farmSlice";
import satelliteSlice from "./slices/satelliteSlice";
import operationSlice from "./slices/operationSlice";

export const store = configureStore({
  reducer: {
    weather: weatherSlice,
    auth: authSlice,
    farmfield: farmSlice,
    satellite: satelliteSlice,
    operation: operationSlice,
  },
});

export default store;
