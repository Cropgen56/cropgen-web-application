import axios from "axios";

let store;

export const attachStore = (reduxStore) => {
  store = reduxStore;
};

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:7070/v1/api",
  withCredentials: true,
  timeout: 30000,
});

// Attach Bearer token to every request
api.interceptors.request.use(
  (config) => {
    const state = store?.getState();
    const token = state?.auth?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
