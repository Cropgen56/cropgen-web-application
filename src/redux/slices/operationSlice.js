import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createOperationAPI,
  getOperationsByFarmFieldAPI,
  updateOperationAPI,
  deleteOperationAPI,
} from "../../api/operationApi";

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

export const updateOperation = createAsyncThunk(
  "operation/updateOperation",
  async ({ operationId, operationData }, { rejectWithValue }) => {
    try {
      const response = await updateOperationAPI({ operationId, operationData });
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update operation"
      );
    }
  }
);

export const deleteOperation = createAsyncThunk(
  "operation/deleteOperation",
  async (operationId, { rejectWithValue }) => {
    try {
      await deleteOperationAPI(operationId);
      return operationId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete operation"
      );
    }
  }
);

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
      .addCase(updateOperation.pending, (state) => {
        state.error = null;
      })
      .addCase(updateOperation.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.operation;
        const index = state.operations.findIndex((op) => op._id === updated._id);
        if (index !== -1) {
          state.operations[index] = updated;
        }
      })
      .addCase(updateOperation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update operation";
      })
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
      })
      .addCase(deleteOperation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOperation.fulfilled, (state, action) => {
        state.loading = false;
        state.operations = state.operations.filter(
          (op) => op._id !== action.payload
        );
      })
      .addCase(deleteOperation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete operation";
      });
  },
});

export const { resetOperationState } = operationSlice.actions;
export default operationSlice.reducer;
