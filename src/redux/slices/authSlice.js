import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getUser,
  updateUser,
  sendOtp,
  verifyOtp,
  completeUserProfile,
  refreshToken,
} from "../../api/authApi";
import { decodeJWT } from "../../utility/decodetoken";

// Async thunk for refreshing access token
export const refreshAccessToken = createAsyncThunk(
  "auth/refreshAccessToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await refreshToken();

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Token refresh failed");
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Token refresh failed");
    }
  }
);

// Async thunk for getting user data
export const getUserData = createAsyncThunk(
  "auth/getUser",
  async (token, { rejectWithValue }) => {
    try {
      const response = await getUser(token);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch user data"
      );
    }
  }
);

// Async thunk for updating user data
export const updateUserData = createAsyncThunk(
  "auth/updateUser",
  async ({ token, id, updateData }, { rejectWithValue }) => {
    try {
      const response = await updateUser({ token, updateData, id });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update user");
    }
  }
);

// Async thunk for sending OTP
export const sendotp = createAsyncThunk(
  "auth/sendOtp",
  async (otpdata, { rejectWithValue }) => {
    try {
      const response = await sendOtp(otpdata);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "OTP sending failed");
    }
  }
);

// Async thunk for verifying OTP
export const verifyuserotp = createAsyncThunk(
  "auth/verifyotp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await verifyOtp({ email, otp });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "OTP verification failed");
    }
  }
);

// Async thunk for completing user profile
export const completeProfile = createAsyncThunk(
  "auth/completeProfile",
  async (
    { token, terms, organizationCode, firstName, lastName, phone, role },
    { rejectWithValue }
  ) => {
    try {
      const response = await completeUserProfile({
        token,
        terms,
        organizationCode,
        firstName,
        lastName,
        phone,
        role,
      });
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Profile completion failed" }
      );
    }
  }
);

// Initial state
const initialState = {
  user: null,
  token: null,
  userDetails: null,
  role: null,
  status: "idle",
  error: null,
  onboardingRequired: false,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.userDetails = null;
      state.role = null;
      state.status = "idle";
      state.error = null;
      state.onboardingRequired = false;
      state.isAuthenticated = false;
    },
    decodeToken: (state) => {
      if (state.token) {
        const userData = decodeJWT(state.token);
        state.user = {
          id: userData.id,
          email: userData.email || userData.sub,
          role: userData.role,
          organizationCode: userData.organizationCode,
        };
        state.role = userData.role;
        state.onboardingRequired = userData.onboardingRequired || false;
        state.isAuthenticated = true;
      }
    },
    resetAuthState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Refresh Access Token
      .addCase(refreshAccessToken.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.accessToken || null;
        state.user = action.payload.user || null;
        state.role = action.payload.role || null;
        state.isAuthenticated = !!action.payload.accessToken;
        state.onboardingRequired = action.payload.onboardingRequired || false;
        state.error = null;
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.role = null;
        state.onboardingRequired = false;
      })
      // Get User Data
      .addCase(getUserData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getUserData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userDetails = action.payload.user || null;
        state.error = null;
      })
      .addCase(getUserData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update User Data
      .addCase(updateUserData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateUserData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userDetails = action.payload.user || state.userDetails;
        state.error = null;
      })
      .addCase(updateUserData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Send OTP
      .addCase(sendotp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(sendotp.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user || state.user;
        state.error = null;
      })
      .addCase(sendotp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Verify OTP
      .addCase(verifyuserotp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyuserotp.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { accessToken, user, role, onboardingRequired } = action.payload;
        state.token = accessToken || null;
        state.user = user || null;
        state.role = role || null;
        state.isAuthenticated = !!accessToken;
        state.onboardingRequired = onboardingRequired || false;
        state.error = null;
      })
      .addCase(verifyuserotp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Complete Profile
      .addCase(completeProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(completeProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { accessToken, user, role, onboardingRequired } = action.payload;
        state.token = accessToken || null;
        state.user = user || state.user;
        state.role = role || state.role;
        state.isAuthenticated = !!accessToken;
        state.onboardingRequired = onboardingRequired || false;
        state.error = null;
      })
      .addCase(completeProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout, decodeToken, resetAuthState } = authSlice.actions;

export default authSlice.reducer;
