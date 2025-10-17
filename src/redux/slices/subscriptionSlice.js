// subscriptionSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createSubscription,
  verifySubscriptionPayment,
  fetchAllSubscriptions,
} from "../../api/subscriptionApi";

export const fetchSubscriptions = createAsyncThunk(
  "subscriptions/fetchSubscriptions",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      if (!token) {
        return rejectWithValue("No authentication token available");
      }
      const response = await fetchAllSubscriptions(token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch subscriptions");
    }
  }
);

export const createUserSubscription = createAsyncThunk(
  "subscriptions/createUserSubscription",
  async (subscriptionData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      if (!token) {
        return rejectWithValue("No authentication token available");
      }
      const response = await createSubscription(subscriptionData, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create subscription");
    }
  }
);

export const verifyUserSubscriptionPayment = createAsyncThunk(
  "subscriptions/verifyUserSubscriptionPayment",
  async ({ subscriptionId, paymentData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      if (!token) {
        return rejectWithValue("No authentication token available");
      }
      const response = await verifySubscriptionPayment(
        subscriptionId,
        paymentData,
        token
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to verify payment");
    }
  }
);

const subscriptionSlice = createSlice({
  name: "subscriptions",
  initialState: {
    subscriptions: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = action.payload;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUserSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserSubscription.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createUserSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyUserSubscriptionPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyUserSubscriptionPayment.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(verifyUserSubscriptionPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default subscriptionSlice.reducer;
