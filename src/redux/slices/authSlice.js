import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { signupAPI, signinAPI } from "../../api/authApi";
import { decodeJWT } from "../../utility/decodetoken";

// Async thunk for signup
export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async (signupData, { rejectWithValue }) => {
    try {
      // Pass the token in the headers for the API request
      const response = await signupAPI(signupData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Signup failed");
    }
  }
);

// Async thunk for signin
export const signinUser = createAsyncThunk(
  "auth/signinUser",
  async (signinData, { rejectWithValue }) => {
    try {
      const response = await signinAPI(signinData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Signin failed");
    }
  }
);

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem("authToken") || null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = "idle";
      localStorage.removeItem("authToken");
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
  },
  extraReducers: (builder) => {
    builder
      // Signup Reducers
      .addCase(signupUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Signin Reducers
      .addCase(signinUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signinUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        localStorage.setItem("authToken", action.payload.token);
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(signinUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout, loadLocalStorage, decodeToken } = authSlice.actions;

export default authSlice.reducer;
