import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { signup, signin, getUser, updateUser } from "../../api/authApi";
import { decodeJWT } from "../../utility/decodetoken";

// Async thunk for signup
export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async (signupData, { rejectWithValue }) => {
    try {
      const response = await signup(signupData);
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
      const response = await signin(signinData);
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

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem("authToken") || null,
  userDetails: null,
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
      });
  },
});

export const { logout, loadLocalStorage, decodeToken, resetAuthState } =
  authSlice.actions;

export default authSlice.reducer;
