import axios from "axios";
import { attachAuthResponseInterceptor } from "./setupAuthInterceptor.js";

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

attachAuthResponseInterceptor(
  api,
  () => store,
  () => onUnauthorized?.(),
);

export default api;
