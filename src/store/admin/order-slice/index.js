import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/api/axios";

const initialState = {
  orderList: [],
  orderDetails: null,
  invoiceSettings: {},
  isLoading: false,
  error: null,
};

export const getAllOrdersForAdmin = createAsyncThunk(
  "/order/getAllOrdersForAdmin",
  async () => {
    const response = await api.get("/api/admin/orders/get");
    return response.data;
  }
);

export const getOrderDetailsForAdmin = createAsyncThunk(
  "/order/getOrderDetailsForAdmin",
  async (id) => {
    const response = await api.get(`/api/admin/orders/details/${id}`);
    return response.data;
  }
);

export const updateOrderStatus = createAsyncThunk(
  "/order/updateOrderStatus",
  async ({ id, orderStatus }) => {
    const response = await api.put(`/api/admin/orders/update/${id}`, {
      orderStatus,
    });
    return response.data;
  }
);

export const deleteOrderForAdmin = createAsyncThunk(
  "/order/deleteOrderForAdmin",
  async (id) => {
    const response = await api.delete(`/api/admin/orders/delete/${id}`);
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

        if (Array.isArray(payloadData)) {
          state.orderList = payloadData;
        } else if (payloadData && payloadData.orders) {
          state.orderList = payloadData.orders;
          state.invoiceSettings = payloadData.invoiceSettings || state.invoiceSettings;
        } else if (Array.isArray(action.payload)) {
          state.orderList = action.payload;
        } else {
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
          state.orderDetails = payloadData || action.payload?.data || null;
        }
      })
      .addCase(getOrderDetailsForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.orderDetails = null;
        state.error = action.error?.message || "Failed to load order details";
      })
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
