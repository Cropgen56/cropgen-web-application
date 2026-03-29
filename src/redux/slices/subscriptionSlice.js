import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createSubscription,
  verifySubscriptionPayment,
  fetchAllSubscriptions,
} from "../../api/subscriptionApi";

function apiErrorMessage(error, fallback = "Something went wrong") {
  const data = error?.response?.data;
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }
  if (Array.isArray(data?.errors) && data.errors.length) {
    return data.errors.map(String).join("; ");
  }
  if (error?.message && !error.message.startsWith("Request failed")) {
    return error.message;
  }
  return fallback;
}

/* -------------------- THUNKS -------------------- */

export const fetchSubscriptions = createAsyncThunk(
  "subscription/fetchSubscriptions",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAllSubscriptions();
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error, "Failed to load plans"));
    }
  },
);

export const createUserSubscription = createAsyncThunk(
  "subscription/createUserSubscription",
  async (payload, { rejectWithValue }) => {
    try {
      return await createSubscription(payload);
    } catch (error) {
      return rejectWithValue(
        apiErrorMessage(error, "Subscription failed. Please try again."),
      );
    }
  },
);

export const verifyUserSubscriptionPayment = createAsyncThunk(
  "subscription/verifyUserSubscriptionPayment",
  async ({ subscriptionId, paymentData }, { rejectWithValue }) => {
    try {
      return await verifySubscriptionPayment(subscriptionId, paymentData);
    } catch (error) {
      return rejectWithValue(
        apiErrorMessage(error, "Payment verification failed."),
      );
    }
  },
);

/* -------------------- SLICE -------------------- */

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState: {
    subscriptions: [],
    loading: false,
    error: null,

    // ✅ Single source of truth for modal
    paymentSuccess: null,
  },

  reducers: {
    setPaymentSuccess: (state, action) => {
      state.paymentSuccess = action.payload;
    },
    clearPaymentSuccess: (state) => {
      state.paymentSuccess = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ---- FETCH PLANS ---- */
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

      /* ---- CREATE SUB ---- */
      .addCase(createUserSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserSubscription.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createUserSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---- VERIFY PAYMENT ---- */
      .addCase(verifyUserSubscriptionPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyUserSubscriptionPayment.fulfilled, (state) => {
        state.loading = false;
        /* paymentSuccess is set in PricingOverlay after unwrap + merged with trial metadata */
      })
      .addCase(verifyUserSubscriptionPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

/* -------------------- EXPORTS -------------------- */

export const { setPaymentSuccess, clearPaymentSuccess, clearError } =
  subscriptionSlice.actions;

export const selectPaymentSuccess = (state) =>
  state.subscription.paymentSuccess;

export default subscriptionSlice.reducer;
