import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const authenticateUser = async (userData) => {
  const response = await axios.post(
    `${API_URL}/api/auth/authenticate`,
    userData
  );

  if (response?.data?.token && response?.data?.user) {
    return {
      token: response.data.token,
      user: response.data.user,
      message: response.data.message || "Authenticated successfully",
    };
  }

  throw new Error("Authentication failed.");
};

// get user API
export const getUser = async (token) => {
  const response = await axios.get(`${API_URL}/api/auth/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// update user API
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

// Forgot password (send reset email)
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

export const sendOtp = async (otpData) => {
  const response = await axios.post(`${API_URL}/api/auth/otp`, otpData);
  return response.data;
};

export const verifyOtp = async ({ email, otp }) => {
  const response = await axios.post(`${API_URL}/api/auth/verify`, {
    email,
    otp,
  });
  return response.data;
};

export const completeUserProfile = async ({
  token,
  terms,
  organizationCode,
}) => {
  const response = await axios.post(
    `${API_URL}/api/auth/complete-profile`,
    { terms, organizationCode },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};
