import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";
import smartAdvisoryApi, {
  updateAdvisoryActivityProgressAPI,
} from "../../api/smartAdvisoryApi";
import { normalizeAdvisory } from "../../utility/normalizeAdvisory";

function cropIdOf(advisory) {
  const crop = advisory?.cropInstanceId;
  if (!crop) return null;
  return String(crop._id ?? crop);
}

/** Multi-crop: pick which crop's advisory to show by default — the
 * main-role crop if there is one, else whichever came first. */
function pickDefaultAdvisory(advisories) {
  if (!advisories?.length) return null;
  return (
    advisories.find((a) => a.cropInstanceId?.cropRole === "main") ??
    advisories[0]
  );
}

/* =====================================================
   FETCH SMART ADVISORY
===================================================== */
export const fetchSmartAdvisory = createAsyncThunk(
  "smartAdvisory/fetchSmartAdvisory",
  async ({ fieldId, cropId } = {}, thunkAPI) => {
    try {
      const res = await smartAdvisoryApi.get(
        `/advisory/${fieldId}?latest=true`,
      );

      const rawList =
        res.data?.advisories ??
        (Array.isArray(res.data?.data) ? res.data.data : []);

      // Multi-crop: the backend now returns the latest advisory PER active
      // crop on this farm (plus a combined farmSummary), not a single doc.
      const advisories = rawList.map(normalizeAdvisory).filter(Boolean);

      return {
        fieldId,
        requestedCropId: cropId || null,
        exists: advisories.length > 0,
        advisories,
        farmSummary: res.data?.farmSummary ?? null,
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const updateAdvisoryActivityProgress = createAsyncThunk(
  "smartAdvisory/updateActivityProgress",
  async ({ advisoryId, activityType, progress }, thunkAPI) => {
    try {
      const data = await updateAdvisoryActivityProgressAPI({
        advisoryId,
        activityType,
        progress,
      });
      return normalizeAdvisory(data.advisory);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || "Failed to update progress",
      );
    }
  },
);

export const sendFarmAdvisoryWhatsApp = createAsyncThunk(
  "smartAdvisory/sendFarmAdvisoryWhatsApp",
  async ({ phone, farmAdvisoryId, language }, thunkAPI) => {
    try {
      const res = await api.post("/api/whatsapp/send-farm-advisory", {
        phone,
        farmAdvisoryId,
        language,
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  },
);

const smartAdvisorySlice = createSlice({
  name: "smartAdvisory",
  initialState: {
    loading: false,
    loadingFieldId: null,

    // Multi-crop: every active crop's latest advisory for the current farm,
    // plus a farm-level combined summary. `advisory`/`selectedCropId` track
    // which one is currently being viewed — existing components that only
    // know about `advisory` keep working unmodified, showing whichever crop
    // is selected (main crop by default).
    advisories: [],
    farmSummary: null,
    selectedCropId: null,

    advisory: null,
    exists: false,
    error: null,

    whatsappSending: false,
    whatsappSuccess: false,
    whatsappError: null,

    progressUpdating: null,
    progressError: null,
  },

  reducers: {
    clearSmartAdvisory(state) {
      state.advisory = null;
      state.advisories = [];
      state.farmSummary = null;
      state.selectedCropId = null;
      state.exists = false;
      state.error = null;
      state.loadingFieldId = null;
    },
    /** Switch which active crop's advisory is shown, from the already-fetched set. */
    selectAdvisoryCrop(state, action) {
      const cropId = action.payload ? String(action.payload) : null;
      const match = state.advisories.find((a) => cropIdOf(a) === cropId);
      if (match) {
        state.advisory = match;
        state.selectedCropId = cropId;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchSmartAdvisory.pending, (state, action) => {
        state.loading = true;
        state.loadingFieldId = action.meta.arg?.fieldId ?? null;
        state.error = null;
      })
      .addCase(fetchSmartAdvisory.fulfilled, (state, action) => {
        if (
          action.payload.fieldId &&
          state.loadingFieldId &&
          action.payload.fieldId !== state.loadingFieldId
        ) {
          return;
        }
        state.loading = false;
        state.loadingFieldId = null;
        state.exists = action.payload.exists;
        state.advisories = action.payload.advisories;
        state.farmSummary = action.payload.farmSummary;

        const requested = action.payload.requestedCropId
          ? action.payload.advisories.find(
              (a) => cropIdOf(a) === String(action.payload.requestedCropId),
            )
          : null;
        const selected = requested ?? pickDefaultAdvisory(action.payload.advisories);
        state.advisory = selected;
        state.selectedCropId = cropIdOf(selected);
      })
      .addCase(fetchSmartAdvisory.rejected, (state, action) => {
        if (
          action.meta.arg?.fieldId &&
          state.loadingFieldId &&
          action.meta.arg.fieldId !== state.loadingFieldId
        ) {
          return;
        }
        state.loading = false;
        state.loadingFieldId = null;
        state.error = action.payload;
      })

      .addCase(updateAdvisoryActivityProgress.pending, (state, action) => {
        state.progressUpdating = action.meta.arg.activityType;
        state.progressError = null;
      })
      .addCase(updateAdvisoryActivityProgress.fulfilled, (state, action) => {
        state.progressUpdating = null;
        state.advisory = action.payload;
        state.exists = true;
        const idx = state.advisories.findIndex((a) => a._id === action.payload?._id);
        if (idx !== -1) state.advisories[idx] = action.payload;
      })
      .addCase(updateAdvisoryActivityProgress.rejected, (state, action) => {
        state.progressUpdating = null;
        state.progressError = action.payload;
      })

      .addCase(sendFarmAdvisoryWhatsApp.pending, (state) => {
        state.whatsappSending = true;
        state.whatsappSuccess = false;
        state.whatsappError = null;
      })
      .addCase(sendFarmAdvisoryWhatsApp.fulfilled, (state) => {
        state.whatsappSending = false;
        state.whatsappSuccess = true;
      })
      .addCase(sendFarmAdvisoryWhatsApp.rejected, (state, action) => {
        state.whatsappSending = false;
        state.whatsappError = action.payload;
      });
  },
});

export const { clearSmartAdvisory, selectAdvisoryCrop } = smartAdvisorySlice.actions;
export default smartAdvisorySlice.reducer;
