import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = "https://aachiamma-backend.fly.dev/api/shop/order";

const initialState = {
  razorpayOrder: null,
  razorpayKeyId: null,
  isLoading: false,
  orderId: null,
  orderList: [],
  orderDetails: null,
  approvalURL: null,
  lastError: null,
};

export const createNewOrder = createAsyncThunk("order/createNewOrder", async (orderData) => {
  const response = await axios.post(`${API_BASE}/create`, orderData);
  return response.data;
});

export const capturePayment = createAsyncThunk("order/capturePayment", async (payload) => {
  const response = await axios.post(`${API_BASE}/capture`, payload);
  return response.data;
});

export const getAllOrdersByUserId = createAsyncThunk("order/getAllOrdersByUserId", async (userId) => {
  const response = await axios.get(`${API_BASE}/list/${userId}`);
  return response.data;
});

export const getOrderDetails = createAsyncThunk("order/getOrderDetails", async (id) => {
  const response = await axios.get(`${API_BASE}/details/${id}`);
  return response.data;
});

const shoppingOrderSlice = createSlice({
  name: "shoppingOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {

      
      state.orderDetails = null;
    },
    clearApprovalURL: (state) => {
      state.approvalURL = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewOrder.pending, (state) => {
        state.isLoading = true;
        state.lastError = null;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success) {
          state.orderId = action.payload?.data?.orderId || null;
          state.razorpayOrder = action.payload?.data?.razorpayOrder || null;
          state.razorpayKeyId = action.payload?.data?.razorpayKeyId || null;
        } else {
          state.lastError = action.payload?.message || "Create order failed";
        }
      })
      .addCase(createNewOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.lastError = action.error?.message || "Create order failed";
      })

      .addCase(capturePayment.pending, (state) => {
        state.isLoading = true;
        state.lastError = null;
      })
      .addCase(capturePayment.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success) {
          state.paymentStatus = "Paid";
        } else {
          state.lastError = action.payload?.message || "Payment capture failed";
        }
      })
      .addCase(capturePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.lastError = action.error?.message || "Payment capture failed";
      })

      .addCase(getAllOrdersByUserId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload?.data || [];
      })
      .addCase(getAllOrdersByUserId.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload?.data || null;
      })
      .addCase(getOrderDetails.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      });
  },
});

export const { resetOrderDetails, clearApprovalURL } = shoppingOrderSlice.actions;

export default shoppingOrderSlice.reducer;
