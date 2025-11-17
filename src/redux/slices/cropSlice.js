import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCrops, getCropHealthYield, generateCropAdvisory } from "../../api/cropApi";

export const fetchCrops = createAsyncThunk(
  "crops/fetchCrops",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getCrops();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchCropHealthYield = createAsyncThunk(
  "crops/fetchCropHealthYield",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await getCropHealthYield(payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// NEW: Fetch crop advisory
export const fetchCropAdvisory = createAsyncThunk(
  "crops/fetchCropAdvisory",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await generateCropAdvisory(payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const cropSlice = createSlice({
  name: "crops",
  initialState: {
    crops: [],
    cropHealthYield: null,
    cropAdvisory: null,
    loading: false,
    error: null,
    healthYieldLoading: false,
    healthYieldError: null,
    advisoryLoading: false,
    advisoryError: null,
  },
  reducers: {
    clearCropHealthYield: (state) => {
      state.cropHealthYield = null;
      state.healthYieldError = null;
    },
    clearCropAdvisory: (state) => {
      state.cropAdvisory = null;
      state.advisoryError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCrops.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCrops.fulfilled, (state, action) => {
        state.loading = false;
        state.crops = action.payload;
      })
      .addCase(fetchCrops.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle crop health and yield states
      .addCase(fetchCropHealthYield.pending, (state) => {
        state.healthYieldLoading = true;
        state.healthYieldError = null;
      })
      .addCase(fetchCropHealthYield.fulfilled, (state, action) => {
        state.healthYieldLoading = false;
        state.cropHealthYield = action.payload;
      })
      .addCase(fetchCropHealthYield.rejected, (state, action) => {
        state.healthYieldLoading = false;
        state.healthYieldError = action.payload;
      })
      // NEW: Handle crop advisory states
      .addCase(fetchCropAdvisory.pending, (state) => {
        state.advisoryLoading = true;
        state.advisoryError = null;
      })
      .addCase(fetchCropAdvisory.fulfilled, (state, action) => {
        state.advisoryLoading = false;
        state.cropAdvisory = action.payload;
      })
      .addCase(fetchCropAdvisory.rejected, (state, action) => {
        state.advisoryLoading = false;
        state.advisoryError = action.payload;
      });
  },
});

export const { clearCropHealthYield, clearCropAdvisory } = cropSlice.actions;
export default cropSlice.reducer;