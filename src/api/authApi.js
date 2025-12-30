import axios from "axios";
import api from "./api.js";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:7070/v1";

// Refresh token
export const refreshToken = async () => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/refresh`,
      {},
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Refresh token error:", error);
    throw error.response?.data?.message || "Token refresh failed";
  }
};

// logout user
export const logoutUserApi = async () => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/logout`,
      {},
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Refresh token error:", error);
    throw error.response?.data?.message || "Token refresh failed";
  }
};

// Get user API
export const getUser = async (token) => {
  const response = await axios.get(`${API_URL}/api/auth/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Get user profile API
export const getUserProfile = async (token) => {
  const response = await axios.get(
    `https://server.cropgenapp.com/v1/api/auth/profile`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Update user API
export const updateUser = async ({ id, token, updateData }) => {
  const response = await axios.patch(
    `${API_URL}/api/auth/update-user/${id}`,
    updateData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Forgot password
export const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/api/auth/forgot-password`, {
    email,
  });
  return response.data;
};

// Reset password
export const resetPassword = async (token, newPassword) => {
  const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
    token,
    newPassword,
  });
  return response.data;
};

// Send OTP
export const sendOtp = async (otpData) => {
  const response = await axios.post(`${API_URL}/api/auth/otp`, otpData);
  return response.data;
};

// Verify OTP
export const verifyOtp = async ({ email, otp }) => {
  const response = await api.post(
    "/api/auth/verify",
    {
      email,
      otp,
    },
    {
      withCredentials: true,
    }
  );
  return response.data;
};

// Complete user profile
export const completeUserProfile = async ({
  token,
  terms,
  organizationCode,
}) => {
  const response = await axios.post(
    `${API_URL}/api/auth/complete-profile`,
    { terms, organizationCode },
    {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Get presigned URL for avatar upload
export const getAvatarPresignedUrl = async (token, fileType) => {
  const response = await axios.post(
    `${API_URL}/api/auth/avatar-presign`,
    { fileType },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};