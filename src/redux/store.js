import { configureStore } from "@reduxjs/toolkit";
import weatherSlice from "./slices/weatherSlice";
import authSlice from "./slices/authSlice";
import farmSlice from "./slices/farmSlice";
import satelliteSlice from "./slices/satelliteSlice";
import operationSlice from "./slices/operationSlice";
import cropReducer from "./slices/cropSlice";
import subscriptionSlice from "./slices/subscriptionSlice";

// Configure the Redux store
export const store = configureStore({
  reducer: {
    weather: weatherSlice,
    auth: authSlice,
    farmfield: farmSlice,
    satellite: satelliteSlice,
    operation: operationSlice,
    crops: cropReducer,
    subscription: subscriptionSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["auth/setCredentials", "auth/logout"],
        ignoredPaths: ["auth.token", "auth.refreshToken"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
