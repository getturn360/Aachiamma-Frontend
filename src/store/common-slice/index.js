import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/api/axios";

const initialState = {
  isLoading: false,
  loadingMessage: null,
  featureImageList: [],
};

export const getFeatureImages = createAsyncThunk(
  "/common/getFeatureImages",
  async () => {
    const response = await api.get("/api/common/feature/get");
    return response.data;
  }
);

export const addFeatureImage = createAsyncThunk(
  "/common/addFeatureImage",
  async (image) => {
    const response = await api.post("/api/common/feature/add", { image });
    return response.data;
  }
);

const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    setLoading(state, action) {
      const payload = action.payload ?? {};
      state.isLoading = Boolean(payload.value);
      state.loadingMessage = payload.message ?? (payload.value ? state.loadingMessage : null);
    },
    setLoadingMessage(state, action) {
      state.loadingMessage = action.payload ?? null;
    },

    clearFeatureImages(state) {
      state.featureImageList = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFeatureImages.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = "Loading feature images...";
      })
      .addCase(getFeatureImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = null;
        state.featureImageList = action.payload?.data ?? [];
      })
      .addCase(getFeatureImages.rejected, (state) => {
        state.isLoading = false;
        state.loadingMessage = null;
        state.featureImageList = [];
      })
      .addCase(addFeatureImage.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = "Uploading image...";
      })
      .addCase(addFeatureImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = null;

        const payloadData = action.payload?.data;
        if (Array.isArray(payloadData)) {
          state.featureImageList = payloadData;
        } else if (payloadData) {
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
