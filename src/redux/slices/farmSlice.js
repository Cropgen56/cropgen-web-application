// redux/slices/farmSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addFieldAPI,
  getFieldAPI,
  updateFieldAPI,
  deleteFieldAPI,
  addCropToFieldAPI,
  updateCropAPI,
  deleteCropAPI,
} from "../../api/farmFieldApi";

// Async thunk for adding a new farm field
export const addFarmField = createAsyncThunk(
  "farm/addFarmField",
  async (
    {
      latlng,
      userId,
      cropName,
      variety,
      sowingDate,
      typeOfIrrigation,
      farmName,
      acre,
      typeOfFarming,
      isBarrenLand,
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await addFieldAPI({
        latlng,
        userId,
        cropName,
        variety,
        sowingDate,
        typeOfIrrigation,
        farmName,
        acre,
        typeOfFarming,
        isBarrenLand,
      });
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to add farm field"
      );
    }
  }
);

// Async thunk for getting farm fields for a user
export const getFarmFields = createAsyncThunk(
  "farm/getFarmFields",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await getFieldAPI(userId);
      // backend returns { message, farmFields: [...] }
      return response.farmFields || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch farm fields"
      );
    }
  }
);

// Async thunk for updating a farm field
export const updateFarmField = createAsyncThunk(
  "farm/updateFarmField",
  async ({ fieldId, updatedData }, { rejectWithValue }) => {
    try {
      const response = await updateFieldAPI(fieldId, updatedData);
      // assuming response.updatedField exists
      return { fieldId, updatedField: response.updatedField || response };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update farm field"
      );
    }
  }
);

// Async thunk for deleting a farm field
export const deleteFarmField = createAsyncThunk(
  "farm/deleteFarmField",
  async (fieldId, { rejectWithValue }) => {
    try {
      await deleteFieldAPI(fieldId);
      return { fieldId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete farm field"
      );
    }
  }
);

// ===================== Multi-crop: crops on a farm =====================

// Add another crop to an existing farm.
export const addCropToFarm = createAsyncThunk(
  "farm/addCropToFarm",
  async ({ fieldId, cropData }, { rejectWithValue }) => {
    try {
      const response = await addCropToFieldAPI(fieldId, cropData);
      return { fieldId, crop: response.crop };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to add crop to farm"
      );
    }
  }
);

// Edit a crop, or mark it harvested (isActive: false).
export const updateCropOnFarm = createAsyncThunk(
  "farm/updateCropOnFarm",
  async ({ fieldId, cropId, updatedData }, { rejectWithValue }) => {
    try {
      const response = await updateCropAPI(fieldId, cropId, updatedData);
      return { fieldId, cropId, crop: response.crop };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update crop"
      );
    }
  }
);

// Remove a mistakenly-added crop.
export const deleteCropFromFarm = createAsyncThunk(
  "farm/deleteCropFromFarm",
  async ({ fieldId, cropId }, { rejectWithValue }) => {
    try {
      await deleteCropAPI(fieldId, cropId);
      return { fieldId, cropId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete crop"
      );
    }
  }
);

// Initial state for the farm fields slice
const initialState = {
  fields: [],
  selectedField: null,
  status: "idle",
  error: null,
};

const farmSlice = createSlice({
  name: "farm",
  initialState,
  reducers: {
    resetFarmState: () => initialState,
    /**
     * Update subscription info for a field.
     * payload: { fieldId, subscription }
     */
    updateFieldSubscription: (state, action) => {
      const { fieldId, subscription } = action.payload || {};
      if (!fieldId) return;
      const idx = state.fields.findIndex((f) => f._id === fieldId);
      if (idx !== -1) {
        state.fields[idx] = {
          ...state.fields[idx],
          subscription: subscription,
        };
      }
    },
    /**
     * Optional: set selectedField in farm slice
     */
    setSelectedFieldLocal: (state, action) => {
      state.selectedField = action.payload || null;
    },
  },
  extraReducers: (builder) => {
    builder

      // Add Farm Field
      .addCase(addFarmField.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addFarmField.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload?.farmField) {
          state.fields.push(action.payload.farmField);
        } else if (Array.isArray(action.payload?.farmFields)) {
          state.fields.push(...action.payload.farmFields);
        } else if (action.payload) {
          // fallback - the API might return the created field directly
          state.fields.push(action.payload);
        }
        state.error = null;
      })
      .addCase(addFarmField.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Get Farm Fields
      .addCase(getFarmFields.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getFarmFields.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.fields = action.payload || [];
        state.error = null;
      })
      .addCase(getFarmFields.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Update Farm Field
      .addCase(updateFarmField.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateFarmField.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { fieldId, updatedField } = action.payload;
        const index = state.fields.findIndex((field) => field._id === fieldId);
        if (index !== -1) {
          state.fields[index] = updatedField;
        }
        state.error = null;
      })
      .addCase(updateFarmField.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Delete Farm Field
      .addCase(deleteFarmField.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteFarmField.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { fieldId } = action.payload;
        state.fields = state.fields.filter((field) => field._id !== fieldId);
        state.error = null;
      })
      .addCase(deleteFarmField.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Add crop to farm
      .addCase(addCropToFarm.fulfilled, (state, action) => {
        const { fieldId, crop } = action.payload;
        const field = state.fields.find((f) => f._id === fieldId);
        if (field && crop) {
          field.crops = [...(field.crops || []), crop];
        }
      })
      .addCase(addCropToFarm.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update crop on farm
      .addCase(updateCropOnFarm.fulfilled, (state, action) => {
        const { fieldId, cropId, crop } = action.payload;
        const field = state.fields.find((f) => f._id === fieldId);
        if (field && Array.isArray(field.crops) && crop) {
          const idx = field.crops.findIndex((c) => c._id === cropId);
          if (idx !== -1) field.crops[idx] = crop;
        }
      })
      .addCase(updateCropOnFarm.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete crop from farm
      .addCase(deleteCropFromFarm.fulfilled, (state, action) => {
        const { fieldId, cropId } = action.payload;
        const field = state.fields.find((f) => f._id === fieldId);
        if (field && Array.isArray(field.crops)) {
          field.crops = field.crops.filter((c) => c._id !== cropId);
        }
      })
      .addCase(deleteCropFromFarm.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { resetFarmState, updateFieldSubscription, setSelectedFieldLocal } =
  farmSlice.actions;
export default farmSlice.reducer;
