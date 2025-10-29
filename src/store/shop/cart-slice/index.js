// src/store/shop/cart-slice/index.js
import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const GUEST_CART_KEY = "guest_cart_v1";

const initialState = {
  cartItems: { items: [] }, // keep server-like structure: { items: [...] }
  isLoading: false,
};

function loadGuestCartArray() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("loadGuestCartArray error", e);
    return [];
  }
}

function saveGuestCartArray(arr) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(arr || []));
  } catch (e) {
    console.error("saveGuestCartArray error", e);
  }
}

/**
 * Helper to compare selectedVariant objects.
 * We do simple JSON stringify of core fields so order/extra meta doesn't break matches.
 */
function variantKey(v) {
  if (!v) return null;
  return JSON.stringify({ label: v.label ?? null, price: v.price ?? null, salePrice: v.salePrice ?? null });
}

/**
 * addToCart({ userId, productId, quantity, productObj? })
 * - If userId provided => server API (send productObj so server can save selectedVariant & unitPriceSaved)
 * - If userId is null/undefined => local guest cart saved to localStorage (includes selectedVariant)
 */
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId = null, productId, quantity = 1, productObj = null }) => {
    if (userId) {
      // pass productObj as well so server can persist variant & unitPriceSaved if needed
      const response = await axios.post("http://localhost:5000/api/shop/cart/add", {
        userId,
        productId,
        quantity,
        productObj,
      });
      return response.data;
    } else {
      // guest: maintain array of items { productId, title, image, price, salePrice?, quantity, selectedVariant }
      const arr = loadGuestCartArray();
      const matchIndex = arr.findIndex(
        (i) => i.productId === productId && variantKey(i.selectedVariant) === variantKey(productObj?.selectedVariant)
      );

      const chosenUnitPrice = (() => {
        // compute saved unit price fields:
        const sv = productObj?.selectedVariant;
        if (sv && Number(sv.salePrice) > 0) return { price: Number(sv.price ?? 0), salePrice: Number(sv.salePrice) };
        if (sv) return { price: Number(sv.price ?? 0), salePrice: 0 };
        if (productObj && Number(productObj.salePrice) > 0) return { price: Number(productObj.price ?? 0), salePrice: Number(productObj.salePrice) };
        if (productObj) return { price: Number(productObj.price ?? 0), salePrice: 0 };
        return { price: 0, salePrice: 0 };
      })();

      if (matchIndex > -1) {
        arr[matchIndex].quantity = (arr[matchIndex].quantity || 0) + quantity;
        // update saved price fields to reflect chosen unit pricing (in case admin updated)
        arr[matchIndex].price = chosenUnitPrice.price;
        arr[matchIndex].salePrice = chosenUnitPrice.salePrice;
      } else {
        arr.push({
          productId,
          title: productObj?.title || productObj?.name || "Product",
          image: productObj?.image || "",
          price: chosenUnitPrice.price,
          salePrice: chosenUnitPrice.salePrice,
          quantity,
          selectedVariant: productObj?.selectedVariant || null,
        });
      }
      saveGuestCartArray(arr);
      // return shape same as server to keep reducer consistent
      return { success: true, data: { items: arr } };
    }
  }
);

export const fetchCartItems = createAsyncThunk("cart/fetchCartItems", async (userId = null) => {
  if (userId) {
    // server path expected: GET /api/shop/cart/get/:userId
    const response = await axios.get(`http://localhost:5000/api/shop/cart/get/${userId}`);
    return response.data;
  } else {
    const arr = loadGuestCartArray();
    return { success: true, data: { items: arr } };
  }
});

export const deleteCartItem = createAsyncThunk("cart/deleteCartItem", async ({ userId = null, productId, selectedVariant = null }) => {
  if (userId) {
    // server expects DELETE /api/shop/cart/:userId/:productId with optional selectedVariant in body
    const response = await axios.delete(`http://localhost:5000/api/shop/cart/${userId}/${productId}`, { data: { selectedVariant } });
    return response.data;
  } else {
    let arr = loadGuestCartArray();
    arr = arr.filter((i) => !(i.productId === productId && variantKey(i.selectedVariant) === variantKey(selectedVariant)));
    saveGuestCartArray(arr);
    return { success: true, data: { items: arr } };
  }
});

export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ userId = null, productId, quantity, selectedVariant = null }) => {
    if (userId) {
      // server expects PUT /api/shop/cart/update-cart with body { userId, productId, quantity, selectedVariant }
      const response = await axios.put("http://localhost:5000/api/shop/cart/update-cart", {
        userId,
        productId,
        quantity,
        selectedVariant,
      });
      return response.data;
    } else {
      const arr = loadGuestCartArray();
      const idx = arr.findIndex((i) => i.productId === productId && variantKey(i.selectedVariant) === variantKey(selectedVariant));
      if (idx > -1) {
        arr[idx].quantity = quantity;
        if (arr[idx].quantity <= 0) {
          arr.splice(idx, 1);
        }
      }
      saveGuestCartArray(arr);
      return { success: true, data: { items: arr } };
    }
  }
);

const shoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {
    // optional helper to clear guest cart from UI
    clearGuestCart(state) {
      state.cartItems = { items: [] };
      saveGuestCartArray([]);
    },
    replaceCart(state, action) {
      // expect action.payload = { items: [...] } or [] ; normalize to { items: [] }
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
        // server returns { data: { items: [...] } } in your existing backend
        if (action.payload && action.payload.data) {
          state.cartItems = action.payload.data;
        } else if (Array.isArray(action.payload)) {
          state.cartItems = { items: action.payload };
        } else {
          // fallback to guest
          state.cartItems = { items: loadGuestCartArray() };
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
        state.cartItems = { items: loadGuestCartArray() };
      })

      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload.data) state.cartItems = action.payload.data;
        else state.cartItems = { items: loadGuestCartArray() };
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
        else state.cartItems = { items: loadGuestCartArray() };
      })
      .addCase(deleteCartItem.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { clearGuestCart, replaceCart } = shoppingCartSlice.actions;
export default shoppingCartSlice.reducer;
