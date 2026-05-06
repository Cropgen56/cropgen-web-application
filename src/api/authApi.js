import axios from "axios";
import api from "./api.js";
import { AUTH_EMAIL_CLIENT_BRAND } from "../config/brand";

const AUTH_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:7070/v1";
const AUTH_CLIENT_APP = "cropgen_web";
export const CROPGEN_REFRESH_STORAGE_KEY = "cropgen_refresh_jwt";
const authBrandPayload = (body) => ({
  ...body,
  clientBrand: AUTH_EMAIL_CLIENT_BRAND,
});
const authBrandConfig = {
  headers: {
    "X-Client-Brand": AUTH_EMAIL_CLIENT_BRAND,
    "X-Client-App": AUTH_CLIENT_APP,
  },
};

// Refresh token — uses raw axios + httpOnly cookie, no Bearer header needed
export const refreshToken = async () => {
  try {
    const stored =
      typeof window !== "undefined"
        ? sessionStorage.getItem(CROPGEN_REFRESH_STORAGE_KEY)
        : null;
    const response = await axios.post(
      `${AUTH_BASE_URL}/api/auth/refresh`,
      stored ? { refreshToken: stored } : {},
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "X-Client-App": AUTH_CLIENT_APP,
        },
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
        headers: {
          "Content-Type": "application/json",
          "X-Client-App": AUTH_CLIENT_APP,
        },
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
    authBrandPayload(otpData),
    authBrandConfig,
  );
  return response.data;
};

// Verify OTP — sets auth cookie, use raw axios with credentials
export const verifyOtp = async ({ email, otp }) => {
  const response = await axios.post(
    `${AUTH_BASE_URL}/api/auth/verify`,
    authBrandPayload({ email, otp }),
    { withCredentials: true, ...authBrandConfig },
  );
  return response.data;
};

// WhatsApp OTP — cropgen routes stay distinct from biodrops routes.
export const sendWhatsappOtp = async (payload) => {
  const response = await axios.post(
    `${AUTH_BASE_URL}/api/auth/send-otp`,
    authBrandPayload(payload),
    authBrandConfig,
  );
  return response.data;
};

export const verifyWhatsappOtp = async ({ phone, otp }) => {
  const response = await axios.post(
    `${AUTH_BASE_URL}/api/auth/verify-otp`,
    authBrandPayload({ phone, otp }),
    { withCredentials: true, ...authBrandConfig },
  );
  return response.data;
};

export const resendWhatsappOtp = async ({ phone }) => {
  const response = await axios.post(
    `${AUTH_BASE_URL}/api/auth/resend-otp`,
    authBrandPayload({ phone }),
    authBrandConfig,
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
  language,
  role,
  country,
  state,
  city,
  village,
}) => {
  const payload = {
    terms,
    organizationCode,
    firstName,
    lastName,
    phone,
    language,
    role,
    country,
    state,
    city,
    village,
    clientBrand: AUTH_EMAIL_CLIENT_BRAND,
  };
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
