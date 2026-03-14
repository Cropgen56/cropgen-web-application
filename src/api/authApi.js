import axios from "axios";
import api from "./api.js";

const AUTH_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:7070/v1";

// Refresh token — uses raw axios + httpOnly cookie, no Bearer header needed
export const refreshToken = async () => {
  try {
    const response = await axios.post(
      `${AUTH_BASE_URL}/api/auth/refresh`,
      {},
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Token refresh failed";
  }
};

// Logout — uses raw axios + httpOnly cookie to clear server-side session
export const logoutUserApi = async () => {
  try {
    const response = await axios.post(
      `${AUTH_BASE_URL}/api/auth/logout`,
      {},
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Logout failed";
  }
};

// Get user profile — token injected by api interceptor
export const getUserProfile = async () => {
  const response = await api.get("/api/auth/profile");
  return response.data;
};

// Update user — token injected by api interceptor
export const updateUser = async ({ id, updateData }) => {
  const response = await api.patch(
    `/api/auth/update-user/${id}`,
    updateData,
  );
  return response.data;
};

// Send OTP — unauthenticated, use raw axios
export const sendOtp = async (otpData) => {
  const response = await axios.post(
    `${AUTH_BASE_URL}/api/auth/otp`,
    otpData,
  );
  return response.data;
};

// Verify OTP — sets auth cookie, use raw axios with credentials
export const verifyOtp = async ({ email, otp }) => {
  const response = await axios.post(
    `${AUTH_BASE_URL}/api/auth/verify`,
    { email, otp },
    { withCredentials: true },
  );
  return response.data;
};

// Complete user profile — token injected by api interceptor
export const completeUserProfile = async ({
  terms,
  organizationCode,
  firstName,
  lastName,
  phone,
  role,
}) => {
  const payload = { terms, organizationCode, firstName, lastName, phone, role };
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  );
  const response = await api.post(
    "/api/auth/complete-profile",
    cleanPayload,
    { withCredentials: true },
  );
  return response.data;
};

// Get presigned URL for avatar upload — token injected by api interceptor
export const getAvatarPresignedUrl = async (fileType) => {
  const response = await api.post("/api/auth/avatar-presign", { fileType });
  return response.data;
};
