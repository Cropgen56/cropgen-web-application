import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { checkFieldSubscription } from "../../api/membership";

// Async thunk to check field subscription
export const checkFieldSubscriptionStatus = createAsyncThunk(
  "membership/checkFieldSubscription",
  async ({ fieldId, authToken }) => {
    const response = await checkFieldSubscription(fieldId, authToken);
    return { fieldId, ...response };
  }
);

const initialState = {
  fieldSubscriptions: {},
  currentFieldId: null,
  currentFieldSubscription: null,
  showMembershipModal: false,
  newFieldAdded: false,
  loading: false,
  isChecking: false, // NEW: Track subscription check status
  error: null,
};

const membershipSlice = createSlice({
  name: "membership",
  initialState,
  reducers: {
    setCurrentField: (state, action) => {
      state.currentFieldId = action.payload;
      const fieldData = state.fieldSubscriptions[action.payload];
      state.currentFieldSubscription = fieldData?.subscription || null;
    },
    displayMembershipModal: (state) => {
      state.showMembershipModal = true;
    },
    hideMembershipModal: (state) => {
      state.showMembershipModal = false;
    },
    setNewFieldAdded: (state, action) => {
      state.newFieldAdded = action.payload;
    },
    resetMembershipState: (state) => {
      state.showMembershipModal = false;
      state.newFieldAdded = false;
    },
    clearFieldSubscriptions: (state) => {
      state.fieldSubscriptions = {};
      state.currentFieldSubscription = null;
    },
    // NEW: Optimistic update for immediate UI response
    optimisticSubscriptionUpdate: (state, action) => {
      const { fieldId, subscription } = action.payload;
      if (state.fieldSubscriptions[fieldId]) {
        state.fieldSubscriptions[fieldId].subscription = subscription;
        state.fieldSubscriptions[fieldId].hasActiveSubscription = true;
      }
      if (fieldId === state.currentFieldId) {
        state.currentFieldSubscription = subscription;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkFieldSubscriptionStatus.pending, (state) => {
        state.loading = true;
        state.isChecking = true; // NEW
        state.error = null;
      })
      .addCase(checkFieldSubscriptionStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isChecking = false; // NEW
        const { fieldId, success, hasActiveSubscription, subscription } =
          action.payload;

        state.fieldSubscriptions[fieldId] = {
          success,
          hasActiveSubscription,
          subscription: subscription || null,
          lastChecked: new Date().toISOString(),
        };

        if (fieldId === state.currentFieldId) {
          state.currentFieldSubscription = subscription || null;
        }
      })
      .addCase(checkFieldSubscriptionStatus.rejected, (state, action) => {
        state.loading = false;
        state.isChecking = false; // NEW
        state.error = action.error.message;
      });
  },
});

export const {
  setCurrentField,
  displayMembershipModal,
  hideMembershipModal,
  setNewFieldAdded,
  resetMembershipState,
  clearFieldSubscriptions,
  optimisticSubscriptionUpdate, // NEW
} = membershipSlice.actions;

// Basic selectors
export const selectFieldSubscriptionStatus = (state, fieldId) =>
  state.membership.fieldSubscriptions[fieldId]?.hasActiveSubscription || false;

export const selectCurrentFieldHasSubscription = (state) =>
  !!state.membership.currentFieldSubscription;

export const selectCurrentFieldSubscription = (state) =>
  state.membership.currentFieldSubscription;

export const selectCurrentFieldFeatures = (state) =>
  state.membership.currentFieldSubscription?.features || {};

// NEW: Selector for checking status
export const selectIsCheckingSubscription = (state) =>
  state.membership.isChecking;

// Helper function to get feature value
const selectHasFeature = (state, featureName) =>
  state.membership.currentFieldSubscription?.features?.[featureName] || false;

// Feature Selectors
export const selectHasSatelliteImagery = (state) =>
  selectHasFeature(state, "satelliteImagery");

export const selectHasCropHealthAndYield = (state) =>
  selectHasFeature(state, "cropHealthAndYield");

export const selectHasSoilAnalysisAndHealth = (state) =>
  selectHasFeature(state, "soilAnalysisAndHealth");

export const selectHasWeatherAnalytics = (state) =>
  selectHasFeature(state, "weatherAnalytics");

export const selectHasVegetationIndices = (state) =>
  selectHasFeature(state, "vegetationIndices");

export const selectHasWaterIndices = (state) =>
  selectHasFeature(state, "waterIndices");

export const selectHasEvapotranspirationMonitoring = (state) =>
  selectHasFeature(state, "evapotranspirationMonitoring");

export const selectHasAgronomicInsights = (state) =>
  selectHasFeature(state, "agronomicInsights");

export const selectHasWeeklyAdvisoryReports = (state) =>
  selectHasFeature(state, "weeklyAdvisoryReports");

export const selectHasCropGrowthMonitoring = (state) =>
  selectHasFeature(state, "cropGrowthMonitoring");

export const selectHasFarmOperationsManagement = (state) =>
  selectHasFeature(state, "farmOperationsManagement");

export const selectHasDiseaseDetectionAlerts = (state) =>
  selectHasFeature(state, "diseaseDetectionAlerts");

export const selectHasSmartAdvisorySystem = (state) =>
  selectHasFeature(state, "smartAdvisorySystem");

export const selectHasSoilReportGeneration = (state) =>
  selectHasFeature(state, "soilReportGeneration");

// Subscription details selectors
export const selectCurrentPlanName = (state) =>
  state.membership.currentFieldSubscription?.planName || null;

export const selectCurrentPlanSlug = (state) =>
  state.membership.currentFieldSubscription?.planSlug || null;

export const selectSubscriptionDaysLeft = (state) =>
  state.membership.currentFieldSubscription?.daysLeft || null;

export const selectIsTrialSubscription = (state) =>
  state.membership.currentFieldSubscription?.isTrial || false;

export const selectSubscriptionHectares = (state) =>
  state.membership.currentFieldSubscription?.hectares || null;

export const selectSubscriptionCurrency = (state) =>
  state.membership.currentFieldSubscription?.currency || null;

export const selectSubscriptionBillingCycle = (state) =>
  state.membership.currentFieldSubscription?.billingCycle || null;

export const selectSubscriptionNextBillingAt = (state) =>
  state.membership.currentFieldSubscription?.nextBillingAt || null;

export default membershipSlice.reducer;