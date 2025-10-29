// client/src/store/common-slice/index.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  loadingMessage: null,
  featureImageList: [],
};

// Thunks (unchanged endpoints)
export const getFeatureImages = createAsyncThunk(
  "/common/getFeatureImages",
  async () => {
    const response = await axios.get(`http://localhost:5000/api/common/feature/get`);
    return response.data;
  }
);

export const addFeatureImage = createAsyncThunk(
  "/common/addFeatureImage",
  async (image) => {
    const response = await axios.post(`http://localhost:5000/api/common/feature/add`, { image });
    return response.data;
  }
);

const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    // global loader control
    setLoading(state, action) {
      const payload = action.payload ?? {};
      state.isLoading = Boolean(payload.value);
      state.loadingMessage = payload.message ?? (payload.value ? state.loadingMessage : null);
    },
    setLoadingMessage(state, action) {
      state.loadingMessage = action.payload ?? null;
    },
    // optional: clear feature list
    clearFeatureImages(state) {
      state.featureImageList = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // getFeatureImages
      .addCase(getFeatureImages.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = "Loading feature images...";
      })
      .addCase(getFeatureImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = null;
        // backend returned { success: true, data: [...] } — keep original assignment
        state.featureImageList = action.payload?.data ?? [];
      })
      .addCase(getFeatureImages.rejected, (state) => {
        state.isLoading = false;
        state.loadingMessage = null;
        state.featureImageList = [];
      })

      // addFeatureImage
      .addCase(addFeatureImage.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = "Uploading image...";
      })
      .addCase(addFeatureImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = null;
        // if backend returns the new list or item, try to merge safely
        const payloadData = action.payload?.data;
        if (Array.isArray(payloadData)) {
          state.featureImageList = payloadData;
        } else if (payloadData) {
          // append single image object if provided
          state.featureImageList = [...state.featureImageList, payloadData];
        }
      })
      .addCase(addFeatureImage.rejected, (state) => {
        state.isLoading = false;
        state.loadingMessage = null;
      });
  },
});

export const { setLoading, setLoadingMessage, clearFeatureImages } = commonSlice.actions;
export default commonSlice.reducer;