import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addFieldAPI, getFieldAPI, updateFieldAPI, deleteFieldAPI } from "../../api/farmFieldApi";

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
      return response;
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
      return { fieldId, updatedField: response.updatedField }; 
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


// Initial state for the farm fields slice
const initialState = {
  fields: [],
  selectedField: null,
  status: "idle",
  error: null,
};

// Farm fields slice
const farmSlice = createSlice({
  name: "farm",
  initialState,
  reducers: {
    resetFarmState: () => initialState,
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
        state.fields.push(action.payload.farmField);
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
        state.fields = action.payload.farmFields;
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
    });

  },
});

export const { resetFarmState } = farmSlice.actions;
export default farmSlice.reducer;
