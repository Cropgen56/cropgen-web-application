
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
    // Add payment success state
    paymentSuccess: null,
    showPaymentSuccessModal: false,
  },
  reducers: {
    // Add payment success actions
    setPaymentSuccess: (state, action) => {
      state.paymentSuccess = action.payload;
      state.showPaymentSuccessModal = true;
    },
    clearPaymentSuccess: (state) => {
      state.paymentSuccess = null;
      state.showPaymentSuccessModal = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
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
        // Optionally set payment success here if the API returns the necessary data
        if (action.payload?.success) {
          const data = action.payload.data || {};
          state.paymentSuccess = {
            fieldName: data.fieldName,
            planName: data.planName,
            features: data.features || [],
            daysLeft: data.daysLeft,
            transactionId: data.transactionId,
          };
          state.showPaymentSuccessModal = true;
        }
      })
      .addCase(verifyUserSubscriptionPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { setPaymentSuccess, clearPaymentSuccess, clearError } = subscriptionSlice.actions;

// Export selectors
export const selectPaymentSuccess = (state) => state.subscription?.paymentSuccess;
export const selectShowPaymentSuccessModal = (state) => state.subscription?.showPaymentSuccessModal;

export default subscriptionSlice.reducer;