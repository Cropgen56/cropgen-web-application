import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAllSubscriptions } from "../../api/subscriptionApi.js";

export const fetchSubscriptions = createAsyncThunk(
    "subscription/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const data = await fetchAllSubscriptions();
            return data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

const subscriptionSlice = createSlice({
    name: "subscription",
    initialState: {
        subscriptions: [],
        loading: false,
        error: null,
    },
    reducers: {
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
            });
    },
});

export const { clearError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
