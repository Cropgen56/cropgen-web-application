import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createSubscription,
  verifySubscriptionPayment,
  fetchAllSubscriptions,
} from "../../api/subscriptionApi";

/* -------------------- THUNKS -------------------- */

export const fetchSubscriptions = createAsyncThunk(
  "subscription/fetchSubscriptions",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("No authentication token available");
      return await fetchAllSubscriptions(token);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createUserSubscription = createAsyncThunk(
  "subscription/createUserSubscription",
  async (payload, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("No authentication token available");
      return await createSubscription(payload, token);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const verifyUserSubscriptionPayment = createAsyncThunk(
  "subscription/verifyUserSubscriptionPayment",
  async ({ subscriptionId, paymentData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("No authentication token available");
      return await verifySubscriptionPayment(
        subscriptionId,
        paymentData,
        token,
      );
    } catch (error) {
      return rejectWithValue(error.message);
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
      .addCase(verifyUserSubscriptionPayment.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload?.success) {
          const data = action.payload.data || {};

          state.paymentSuccess = {
            fieldName: data.fieldName,
            planName: data.planName,
            features: data.features || [],
            daysLeft: data.daysLeft,
            transactionId: data.transactionId,
            subscriptionId: data.subscriptionId,
          };
        }
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
