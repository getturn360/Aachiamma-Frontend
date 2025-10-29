import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  orderList: [],
  orderDetails: null,
  invoiceSettings: {}, // NEW: store invoice settings from server
  isLoading: false,
  error: null,
};

export const getAllOrdersForAdmin = createAsyncThunk(
  "/order/getAllOrdersForAdmin",
  async () => {
    const response = await axios.get(`http://localhost:5000/api/admin/orders/get`);
    // response.data expected shape: { success: true, data: { orders, invoiceSettings } }
    return response.data;
  }
);

export const getOrderDetailsForAdmin = createAsyncThunk(
  "/order/getOrderDetailsForAdmin",
  async (id) => {
    const response = await axios.get(`http://localhost:5000/api/admin/orders/details/${id}`);
    // response.data expected shape: { success: true, data: { order, invoiceSettings } }
    return response.data;
  }
);

export const updateOrderStatus = createAsyncThunk(
  "/order/updateOrderStatus",
  async ({ id, orderStatus }) => {
    const response = await axios.put(`http://localhost:5000/api/admin/orders/update/${id}`, {
      orderStatus,
    });
    return response.data;
  }
);

// NEW: delete order thunk
export const deleteOrderForAdmin = createAsyncThunk(
  "/order/deleteOrderForAdmin",
  async (id) => {
    const response = await axios.delete(`http://localhost:5000/api/admin/orders/delete/${id}`);
    return { id, data: response.data };
  }
);

const adminOrderSlice = createSlice({
  name: "adminOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllOrdersForAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllOrdersForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        const payloadData = action.payload && action.payload.data;

        // Backward compatible handling:
        // - Old: data === [orders array]
        // - New: data = { orders: [...], invoiceSettings: {...} }
        if (Array.isArray(payloadData)) {
          state.orderList = payloadData;
        } else if (payloadData && payloadData.orders) {
          state.orderList = payloadData.orders;
          state.invoiceSettings = payloadData.invoiceSettings || state.invoiceSettings;
        } else if (Array.isArray(action.payload)) {
          state.orderList = action.payload;
        } else {
          // fallback: unknown shape -> leave orderList empty
          state.orderList = payloadData || [];
        }
      })
      .addCase(getAllOrdersForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.orderList = [];
        state.error = action.error?.message || "Failed to load orders";
      })
      .addCase(getOrderDetailsForAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderDetailsForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        const payloadData = action.payload && action.payload.data;
        if (payloadData && payloadData.order) {
          state.orderDetails = payloadData.order;
          if (payloadData.invoiceSettings) {
            state.invoiceSettings = payloadData.invoiceSettings;
          }
        } else {
          // older shape: payload.data === order object
          state.orderDetails = payloadData || action.payload?.data || null;
        }
      })
      .addCase(getOrderDetailsForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.orderDetails = null;
        state.error = action.error?.message || "Failed to load order details";
      })

      // delete handlers
      .addCase(deleteOrderForAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteOrderForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        const delId = action.payload && action.payload.id;
        if (delId) {
          state.orderList = (state.orderList || []).filter((o) => String(o._id) !== String(delId));
          if (state.orderDetails && String(state.orderDetails._id) === String(delId)) {
            state.orderDetails = null;
          }
        }
      })
      .addCase(deleteOrderForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error?.message || "Failed to delete order";
      });
  },
});

export const { resetOrderDetails } = adminOrderSlice.actions;

export default adminOrderSlice.reducer;
