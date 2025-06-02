// operationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createOperationAPI,
  getOperationsByFarmFieldAPI,
} from "../../api/operationApi";

// Existing async thunk for creating operation
export const createOperation = createAsyncThunk(
  "operation/createOperation",
  async ({ farmId, operationData }, { rejectWithValue }) => {
    try {
      const response = await createOperationAPI({ farmId, operationData });
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to create operation"
      );
    }
  }
);

// Async thunk for fetching operations (already defined above)
export const getOperationsByFarmField = createAsyncThunk(
  "operation/getOperationsByFarmField",
  async ({ farmId }, { rejectWithValue }) => {
    try {
      const response = await getOperationsByFarmFieldAPI({ farmId });

      return response.operations;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch operations");
    }
  }
);

// Initial state for the operation slice
const initialState = {
  operations: [],
  loading: false,
  error: null,
};

const operationSlice = createSlice({
  name: "operation",
  initialState,
  reducers: {
    resetOperationState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Create operation cases
      .addCase(createOperation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOperation.fulfilled, (state, action) => {
        state.loading = false;
        state.operations.push(action.payload.operation);
      })
      .addCase(createOperation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add operation";
      })
      // Get operations by farm field cases
      .addCase(getOperationsByFarmField.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOperationsByFarmField.fulfilled, (state, action) => {
        state.loading = false;
        state.operations = action.payload;
      })
      .addCase(getOperationsByFarmField.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch operations";
      });
  },
});

export const { resetOperationState } = operationSlice.actions;
export default operationSlice.reducer;
