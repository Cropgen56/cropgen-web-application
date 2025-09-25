
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCrops } from "../../api/cropApi";


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

const cropSlice = createSlice({
  name: "crops",
  initialState: {
    crops: [],
    loading: false,
    error: null,
  },
  reducers: {},
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
      });
  },
});

export default cropSlice.reducer;
