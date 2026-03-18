import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/axios";

const initialState = {
  isLoading: false,
  reviews: [],
  error: null,
};

export const addReview = createAsyncThunk(
  "shop/reviews/addReview",
  async (formdata, { rejectWithValue }) => {
    try {
      const response = await api.post(`api/shop/review/add`, formdata);
    
      return response.data;
    } catch (err) {
      const payload = err.response?.data || { message: err.message || "Network error" };
      return rejectWithValue(payload);
    }
  }
);

export const getReviews = createAsyncThunk(
  "api/shop/reviews/getReviews",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`api/shop/review/${productId}`);
      return response.data;
    } catch (err) {
      const payload = err.response?.data || { message: err.message || "Network error" };
      return rejectWithValue(payload);
    }
  }
);

const reviewSlice = createSlice({
  name: "shop/reviews",
  initialState,
  reducers: {
    clearReviews: (state) => {
      state.reviews = [];
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
   
      .addCase(addReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.isLoading = false;
  
      })
      .addCase(addReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.error?.message || "Failed to add review";
      })

      .addCase(getReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload?.data || [];
      })
      .addCase(getReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.reviews = [];
        state.error = action.payload?.message || "Failed to load reviews";
      });
  },
});

export const { clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;