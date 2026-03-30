import { configureStore } from "@reduxjs/toolkit";
import weatherSlice from "./slices/weatherSlice";
import authSlice, { authInitialState, decodeToken } from "./slices/authSlice";
import farmSlice from "./slices/farmSlice";
import satelliteSlice from "./slices/satelliteSlice";
import operationSlice from "./slices/operationSlice";
import cropReducer from "./slices/cropSlice";
import subscriptionSlice from "./slices/subscriptionSlice";
import membershipReducer from "./slices/membershipSlice";
import smartAdvisoryReducer from "./slices/smartAdvisorySlice";

const AUTH_TOKEN_KEY = "authToken";

/** Persist access token so refresh keeps the session (cookie refresh remains primary). */
const authTokenPersistMiddleware = (storeApi) => (next) => (action) => {
  const prevToken = storeApi.getState().auth?.token;
  const result = next(action);
  const nextToken = storeApi.getState().auth?.token;
  if (typeof window === "undefined") return result;
  if (nextToken && nextToken !== prevToken) {
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
    } catch {
      /* ignore quota */
    }
  } else if (!nextToken && prevToken) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
  return result;
};

const persistedToken =
  typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;

const preloadedState =
  persistedToken != null && persistedToken !== ""
    ? {
        auth: {
          ...authInitialState,
          token: persistedToken,
        },
      }
    : undefined;

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
    membership: membershipReducer,
    smartAdvisory: smartAdvisoryReducer,
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["auth/setCredentials", "auth/logout"],
        // ignoredPaths: ["auth.token", "auth.refreshToken"],
        ignoredPaths: ["auth.token"],
      },
    }).concat(authTokenPersistMiddleware),
  devTools: process.env.NODE_ENV !== "production",
});

if (persistedToken) {
  store.dispatch(decodeToken());
}

export default store;
