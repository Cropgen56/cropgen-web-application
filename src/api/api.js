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
    if (error.response?.status === 401) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

export default api;
