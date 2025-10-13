import axios from "axios";
import store from "../redux/store";
import { refreshAccessToken, logout } from "../redux/slices/authSlice";

// Create an Axios instance
const api = axios.create({
  baseURL: "http://localhost:7070/v1/api",
  withCredentials: true,
});

// Add response interceptor
api.interceptors.response.use(
  (response) => response, // Return successful responses unchanged
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const result = await store.dispatch(refreshAccessToken()).unwrap(); // Dispatch refreshAccessToken thunk
        if (result.success) {
          // Update Authorization header with new access token
          error.config.headers.Authorization = `Bearer ${result.accessToken}`;
          return api(error.config); // Retry the original request
        } else {
          store.dispatch(logout());
          return Promise.reject(error);
        }
      } catch (refreshError) {
        store.dispatch(logout()); // Log out on refresh error
        return Promise.reject(error);
      }
    }
    return Promise.reject(error); // Pass through other errors
  }
);

export default api;
