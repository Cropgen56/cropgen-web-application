import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { checkFieldSubscription } from '../../api/membership';

// Async thunk to check field subscription
export const checkFieldSubscriptionStatus = createAsyncThunk(
  'membership/checkFieldSubscription',
  async ({ fieldId, authToken }) => {
    const response = await checkFieldSubscription(fieldId, authToken);
    return { fieldId, ...response };
  }
);

const initialState = {
  fieldSubscriptions: {}, // Store subscription status per field
  currentFieldId: null,
  currentFieldHasSubscription: false,
  showMembershipModal: false,
  newFieldAdded: false,
  loading: false,
  error: null,
};

const membershipSlice = createSlice({
  name: 'membership',
  initialState,
  reducers: {
    setCurrentField: (state, action) => {
      state.currentFieldId = action.payload;
      state.currentFieldHasSubscription = state.fieldSubscriptions[action.payload]?.hasActiveSubscription || false;
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
      state.currentFieldHasSubscription = false;
    }
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
        const { fieldId, hasActiveSubscription, message } = action.payload;
        state.fieldSubscriptions[fieldId] = {
          hasActiveSubscription,
          message,
          lastChecked: new Date().toISOString()
        };
        if (fieldId === state.currentFieldId) {
          state.currentFieldHasSubscription = hasActiveSubscription;
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
  clearFieldSubscriptions
} = membershipSlice.actions;

export const selectFieldSubscriptionStatus = (state, fieldId) => 
  state.membership.fieldSubscriptions[fieldId]?.hasActiveSubscription || false;

export const selectCurrentFieldHasSubscription = (state) => 
  state.membership.currentFieldHasSubscription;

export default membershipSlice.reducer;