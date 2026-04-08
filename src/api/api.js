import axios from "axios";

let store;
let onUnauthorized = null;

export const attachStore = (reduxStore) => {
  store = reduxStore;
};

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:7070/v1",
  withCredentials: true,
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    config.headers["X-Client-App"] = "cropgen_web";
    const token = store?.getState()?.auth?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only clear session when the server rejected a request that sent Bearer auth.
    // Avoids treating unauthenticated 401s as "log the user out" during bootstrap.
    const authHeader =
      error.config?.headers?.Authorization ||
      error.config?.headers?.authorization;
    const hadBearer =
      typeof authHeader === "string" && authHeader.startsWith("Bearer ");
    if (error.response?.status === 401 && hadBearer) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

export default api;
