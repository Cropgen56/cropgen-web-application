import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUser, updateUser, authenticateUser, sendOtp, verifyOtp, completeUserProfile } from "../../api/authApi";
import { decodeJWT } from "../../utility/decodetoken";

// Async thunk for signin
export const userLoginSignup = createAsyncThunk(
  "auth/userLoginSignup",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authenticateUser(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Signin failed");
    }
  }
);

// Async thunk for signin
export const getUserData = createAsyncThunk(
  "auth/getUser",
  async (token, { rejectWithValue }) => {
    try {
      const response = await getUser(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Signin failed");
    }
  }
);

// Async thunk for signin
export const updateUserData = createAsyncThunk(
  "auth/updateUser",
  async ({ token, id, updateData }, { rejectWithValue }) => {
    try {
      const response = await updateUser({ token, updateData, id });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Signin failed");
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
    }
    catch (error) {
      return rejectWithValue(error.response?.data || "otp verification failed")
    }
  }
)

export const completeProfile = createAsyncThunk(
  "auth/completeProfile",
  async ({ token, terms, organizationCode }, { rejectWithValue }) => {
    try {
      const response = await completeUserProfile({ token, terms, organizationCode });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Profile completion failed" });
    }
  }
);


// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem("authToken") || null,
  userDetails: null,
  status: "idle",
  error: null,
  onboardingRequired: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = "idle";
    },
    loadLocalStorage: (state) => {
      const token = localStorage.getItem("authToken");
      state.token = token;
    },
    decodeToken: (state) => {
      if (state.token) {
        const userData = decodeJWT(state.token);
        state.user = userData;
      }
    },
    resetAuthState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Signup Reducers
      .addCase(userLoginSignup.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(userLoginSignup.fulfilled, (state, action) => {
        state.status = "succeeded";
        localStorage.setItem("authToken", action.payload.token);
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(userLoginSignup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // get user Reducers
      .addCase(getUserData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getUserData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userDetails = action.payload.user;
        state.error = null;
      })
      .addCase(getUserData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // get user Reducers
      .addCase(updateUserData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateUserData.fulfilled, (state, action) => {
        state.status = "succeeded";
        // state.userDetails = action.payload.user;
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
        if (accessToken) {
          localStorage.setItem("authToken", accessToken);
          state.token = accessToken;
        }

        state.user = user || null;
        state.role = role || null;
        state.onboardingRequired = onboardingRequired || false;
        state.error = null;
      })
      .addCase(verifyuserotp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Complete Profile Reducers
      .addCase(completeProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(completeProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload.user) {
          state.user = action.payload.user;
        }
        state.onboardingRequired = false;
        state.error = null;
      })
      .addCase(completeProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout, loadLocalStorage, decodeToken, resetAuthState } =
  authSlice.actions;

export default authSlice.reducer;
