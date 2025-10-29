import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  productList: [],
  productDetails: null,
};

export const fetchAllFilteredProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async ({ filterParams, sortParams }) => {
    console.log(fetchAllFilteredProducts, "fetchAllFilteredProducts");

    const query = new URLSearchParams({
      ...filterParams,
      sortBy: sortParams,
    });

    const result = await axios.get(
      `http://localhost:5000/api/shop/products/get?${query}`
    );

    console.log(result);

    return result?.data;
  }
);

export const fetchProductDetails = createAsyncThunk(
  "/products/fetchProductDetails",
  async (id) => {
    const result = await axios.get(
      `http://localhost:5000/api/shop/products/get/${id}`
    );

    return result?.data;
  }
);

const shoppingProductSlice = createSlice({
  name: "shoppingProducts",
  initialState,
  reducers: {
    setProductDetails: (state) => {
      state.productDetails = null;
    },
    // ADD: update single product inside productList (merge provided fields)
    updateProductInList: (state, action) => {
      const payload = action.payload || {};
      const productId = payload.productId || payload._id;
      if (!productId) return;
      const idx = Array.isArray(state.productList) ? state.productList.findIndex(p => p._id === productId) : -1;
      if (idx === -1) {
        // if product not present, optionally push fullProduct if provided
        if (payload.fullProduct) {
          state.productList = state.productList || [];
          state.productList.push(payload.fullProduct);
        }
        return;
      }
      const existing = state.productList[idx] || {};
      const merged = { ...existing, ...(payload.updates || payload), ...(payload.fullProduct || {}) };
      state.productList[idx] = merged;
      // Also update productDetails if it's the same product
      if (state.productDetails && state.productDetails._id === productId) {
        state.productDetails = { ...state.productDetails, ...(payload.updates || payload), ...(payload.fullProduct || {}) };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilteredProducts.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
      })
      .addCase(fetchAllFilteredProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = [];
      })
      .addCase(fetchProductDetails.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productDetails = action.payload.data;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.productDetails = null;
      });
  },
});

export const { setProductDetails, updateProductInList } = shoppingProductSlice.actions;

export default shoppingProductSlice.reducer;