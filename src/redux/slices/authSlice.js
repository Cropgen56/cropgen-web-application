import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getUser,
  getUserProfile,
  updateUser,
  sendOtp,
  verifyOtp,
  completeUserProfile,
  refreshToken,
  logoutUserApi,
} from "../../api/authApi";
import { decodeJWT } from "../../utility/decodetoken";

// Add a refresh lock utility
const refreshLock = {
  isLocked: false,
  queue: [],
  acquire() {
    if (this.isLocked) {
      return new Promise((resolve, reject) => {
        this.queue.push({ resolve, reject });
      });
    }
    this.isLocked = true;
    return Promise.resolve();
  },
  release(error = null, token = null) {
    this.isLocked = false;
    this.queue.forEach(({ resolve, reject }) => {
      if (error) reject(error);
      else resolve(token);
    });
    this.queue = [];
  },
};

export const refreshAccessToken = createAsyncThunk(
  "auth/refreshAccessToken",
  async (_, { rejectWithValue }) => {
    try {
      await refreshLock.acquire();
      const response = await refreshToken();

      if (!response.accessToken) {
        throw new Error("No access token in response");
      }

      refreshLock.release(null, response.accessToken);
      return response;
    } catch (error) {
      refreshLock.release(error);
      return rejectWithValue(error.message || "Token refresh failed");
    }
  },
  {
    condition: (_, { getState }) => {
      const { auth } = getState();
      return !auth.refreshPending;
    },
  }
);

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

export const getUserProfileData = createAsyncThunk(
  "auth/getUserProfile",
  async (token, { rejectWithValue }) => {
    try {
      const response = await getUserProfile(token);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch user profile"
      );
    }
  }
);

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

export const logoutUser = createAsyncThunk(
  "auth/verifyotp",
  async (_, { rejectWithValue }) => {
    try {
      const response = await logoutUserApi();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "OTP verification failed");
    }
  }
);

const initialState = {
  user: null,
  token: null,
  userDetails: null,
  userProfile: null,
  role: null,
  status: "idle",
  profileStatus: "idle",
  error: null,
  onboardingRequired: false,
  isAuthenticated: false,
  refreshPending: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.userDetails = null;
      state.userProfile = null;
      state.role = null;
      state.status = "idle";
      state.profileStatus = "idle";
      state.error = null;
      state.onboardingRequired = false;
      state.isAuthenticated = false;
      state.refreshPending = false;
    },
    decodeToken: (state) => {
      if (state.token) {
        try {
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
        } catch (error) {
          state.isAuthenticated = false;
          state.user = null;
          state.role = null;
          state.onboardingRequired = false;
          state.error = "Invalid token";
        }
      }
    },
    setGoogleLoginData: (state, action) => {
      const { accessToken, user, role, onboardingRequired } = action.payload;
      state.token = accessToken;
      state.user = user;
      state.role = role;
      state.onboardingRequired = onboardingRequired;
      state.isAuthenticated = !!accessToken;
      state.status = "succeeded";
      state.error = null;
    },
    resetAuthState: () => initialState,
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshAccessToken.pending, (state) => {
        state.status = "loading";
        state.refreshPending = true;
        state.error = null;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.refreshPending = false;
        state.token = action.payload.accessToken;
        state.user = action.payload.user || null;
        state.role = action.payload.role || null;
        state.isAuthenticated = !!action.payload.accessToken;
        state.onboardingRequired = action.payload.onboardingRequired || false;
        state.error = null;
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.status = "failed";
        state.refreshPending = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.role = null;
        state.onboardingRequired = false;
      })
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
      .addCase(getUserProfileData.pending, (state) => {
        state.profileStatus = "loading";
        state.error = null;
      })
      .addCase(getUserProfileData.fulfilled, (state, action) => {
        state.profileStatus = "succeeded";
        state.userProfile = action.payload.user || null;
        state.error = null;
      })
      .addCase(getUserProfileData.rejected, (state, action) => {
        state.profileStatus = "failed";
        state.error = action.payload;
      })
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
      .addCase(verifyuserotp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyuserotp.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { accessToken, user, role, onboardingRequired } = action.payload;
        state.token = accessToken;
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
      })
      .addMatcher(
        (action) =>
          action.type.endsWith("/fulfilled") ||
          action.type.endsWith("/rejected"),
        (state) => {
          state.status = "idle";
        }
      );
  },
});

export const {
  logout,
  decodeToken,
  resetAuthState,
  setGoogleLoginData,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;