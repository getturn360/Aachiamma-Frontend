// src/store/shop/cart-slice/index.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/axios";

const GUEST_CART_KEY = "guest_cart_v1";

const initialState = {
  cartItems: { items: [] },
  isLoading: false,
};

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId = null, productId, quantity = 1, productObj = null }) => {
    if (!userId) {
      return { success: false, message: "Login required to add items to cart" };
    }

    const response = await api.post("/api/shop/cart/add", {
      userId,
      productId,
      quantity,
      productObj,
    });
    return response.data;
  }
);

export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (userId = null) => {
    if (!userId) {
      return { success: true, data: { items: [] } };
    }
    const response = await api.get(`/api/shop/cart/get/${userId}`);
    return response.data;
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ userId = null, productId, selectedVariant = null }) => {
    if (!userId) {
      return { success: false, message: "Login required" };
    }
    const response = await api.delete(`/api/shop/cart/${userId}/${productId}`, {
      data: { selectedVariant },
    });
    return response.data;
  }
);

export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ userId = null, productId, quantity, selectedVariant = null }) => {
    if (!userId) {
      return { success: false, message: "Login required" };
    }
    const response = await api.put("/api/shop/cart/update-cart", {
      userId,
      productId,
      quantity,
      selectedVariant,
    });
    return response.data;
  }
);

const shoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {
    clearGuestCart(state) {
      state.cartItems = { items: [] };
      try {
        localStorage.removeItem(GUEST_CART_KEY);
      } catch {
        // ignore
      }
    },
    replaceCart(state, action) {
      const payload = action.payload;
      if (Array.isArray(payload)) state.cartItems = { items: payload };
      else state.cartItems = payload || { items: [] };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload.data) {
          state.cartItems = action.payload.data;
        } else if (Array.isArray(action.payload)) {
          state.cartItems = { items: action.payload };
        }
      })
      .addCase(addToCart.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload.data) {
          state.cartItems = action.payload.data;
        } else if (Array.isArray(action.payload)) {
          state.cartItems = { items: action.payload };
        } else {
          state.cartItems = { items: [] };
        }
      })
      .addCase(fetchCartItems.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = { items: [] };
      })
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload.data) state.cartItems = action.payload.data;
      })
      .addCase(updateCartQuantity.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload.data) state.cartItems = action.payload.data;
      })
      .addCase(deleteCartItem.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { clearGuestCart, replaceCart } = shoppingCartSlice.actions;
export default shoppingCartSlice.reducer;
