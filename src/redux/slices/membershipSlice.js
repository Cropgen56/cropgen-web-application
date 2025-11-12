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
  },
  extraReducers: (builder) => {
    builder
      // Check field subscription
      .addCase(checkFieldSubscriptionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkFieldSubscriptionStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { fieldId, success, hasActiveSubscription, subscription } =
          action.payload;

        // Store complete subscription data for the field
        state.fieldSubscriptions[fieldId] = {
          success,
          hasActiveSubscription,
          subscription: subscription || null,
          lastChecked: new Date().toISOString(),
        };

        // If this is the current field, update currentFieldSubscription
        if (fieldId === state.currentFieldId) {
          state.currentFieldSubscription = subscription || null;
        }
      })
      .addCase(checkFieldSubscriptionStatus.rejected, (state, action) => {
        state.loading = false;
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
} = membershipSlice.actions;

// Basic selectors
export const selectFieldSubscriptionStatus = (state, fieldId) =>
  state.membership.fieldSubscriptions[fieldId]?.hasActiveSubscription || false;

export const selectCurrentFieldHasSubscription = (state) =>
  !!state.membership.currentFieldSubscription;

export const selectCurrentFieldSubscription = (state) =>
  state.membership.currentFieldSubscription;

// Feature-specific selectors
export const selectCurrentFieldFeatures = (state) =>
  state.membership.currentFieldSubscription?.features || {};

export const selectHasFeature = (state, featureName) =>
  state.membership.currentFieldSubscription?.features?.[featureName] || false;

// Component Feature Mapping Selectors
export const selectHasWeatherHistory = (state) =>
  selectHasFeature(state, "graphHistoricalData");

export const selectHasSatelliteMonitoring = (state) =>
  selectHasFeature(state, "satelliteCropMonitoring");

export const selectHasWeatherForecast = (state) =>
  selectHasFeature(state, "weatherForecast");

export const selectHasSoilMoistureTemp = (state) =>
  selectHasFeature(state, "soilMoistureTemp");

export const selectHasGrowthStageTracking = (state) =>
  selectHasFeature(state, "growthStageTracking");

export const selectHasAdvisory = (state) => selectHasFeature(state, "advisory");

export const selectHasInsights = (state) => selectHasFeature(state, "insights");

export const selectHasSoilFertility = (state) =>
  selectHasFeature(state, "soilFertilityAnalysis");

export const selectHasOperationsManagement = (state) =>
  selectHasFeature(state, "operationsManagement");

// Other feature selectors
export const selectHasIrrigationUpdates = (state) =>
  selectHasFeature(state, "irrigationUpdates");

export const selectHasPestDiseaseAlerts = (state) =>
  selectHasFeature(state, "pestDiseaseAlerts");

export const selectHasYieldPrediction = (state) =>
  selectHasFeature(state, "yieldPrediction");

export const selectHasHarvestWindow = (state) =>
  selectHasFeature(state, "harvestWindow");

export const selectHasSocCarbon = (state) =>
  selectHasFeature(state, "socCarbon");

export const selectHasAdvisoryControl = (state) =>
  selectHasFeature(state, "advisoryControl");

export const selectHasAdvisoryDelivery = (state) =>
  selectHasFeature(state, "advisoryDelivery");

export const selectHasWeeklyReports = (state) =>
  selectHasFeature(state, "weeklyReports");

export const selectHasApiIntegration = (state) =>
  selectHasFeature(state, "apiIntegration");

export const selectHasEnterpriseSupport = (state) =>
  selectHasFeature(state, "enterpriseSupport");

// Subscription details selectors
export const selectCurrentPlanName = (state) =>
  state.membership.currentFieldSubscription?.planName || null;

export const selectCurrentPlanSlug = (state) =>
  state.membership.currentFieldSubscription?.planSlug || null;

export const selectSubscriptionDaysLeft = (state) =>
  state.membership.currentFieldSubscription?.daysLeft || null;

export const selectIsTrialSubscription = (state) =>
  state.membership.currentFieldSubscription?.isTrial || false;

export default membershipSlice.reducer;
