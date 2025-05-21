import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addFieldAPI, getFieldAPI } from "../../api/farmFieldApi";

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
  reducers: {},
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
      });
  },
});

export default farmSlice.reducer;
