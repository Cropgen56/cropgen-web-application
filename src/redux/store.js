import { configureStore } from "@reduxjs/toolkit";
import weatherSlice from "./slices/weatherSlice/index";

export const store = configureStore({
  reducer: {
    weather: weatherSlice,
  },
});

export default store;
