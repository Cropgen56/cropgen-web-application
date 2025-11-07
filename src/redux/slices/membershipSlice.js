import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isMember: false,
  showMembershipModal: false,
  hasSkippedMembership: false,
  newFieldAdded: false,
};

const membershipSlice = createSlice({
  name: 'membership',
  initialState,
  reducers: {
    setMembershipStatus: (state, action) => {
      state.isMember = action.payload;
    },
    displayMembershipModal: (state) => {  // Renamed from showMembershipModal
      state.showMembershipModal = true;
    },
    hideMembershipModal: (state) => {
      state.showMembershipModal = false;
    },
    skipMembership: (state) => {
      state.hasSkippedMembership = true;
      state.showMembershipModal = false;
    },
    activateMembership: (state) => {
      state.isMember = true;
      state.hasSkippedMembership = false;
      state.showMembershipModal = false;
    },
    setNewFieldAdded: (state, action) => {
      state.newFieldAdded = action.payload;
    },
    resetMembershipState: (state) => {
      state.showMembershipModal = false;
      state.newFieldAdded = false;
    }
  },
});

export const {
  setMembershipStatus,
  displayMembershipModal,  // Renamed export
  hideMembershipModal,
  skipMembership,
  activateMembership,
  setNewFieldAdded,
  resetMembershipState
} = membershipSlice.actions;

export default membershipSlice.reducer;