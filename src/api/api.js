import axios from "axios";
import { API_BASE_URL } from "../config/envUrls.js";
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
  baseURL: API_BASE_URL,
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
