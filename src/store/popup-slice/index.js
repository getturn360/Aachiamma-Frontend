import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/api/axios"; // use configured axios instance (withCredentials)

// Thunks
export const fetchPopups = createAsyncThunk(
  "popup/fetchPopups",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/common/popups/get`);
      return res.data.list || [];
    } catch (err) {
      // prefer server-provided error body when available
      return rejectWithValue(err.response?.data || err.message || "Unknown error");
    }
  }
);

export const fetchAdminPopups = createAsyncThunk(
  "popup/fetchAdminPopups",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/admin/popups/get`);
      return res.data.list || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message || "Unknown error");
    }
  }
);

const initialState = {
  isLoading: false,
  list: [],
  adminList: [],
  error: null,
};

const slice = createSlice({
  name: "popup",
  initialState,
  reducers: {
    // Keep reducers empty for now — thunks handle async flows.
  },
  extraReducers: (builder) => {
    builder
      // fetchPopups
      .addCase(fetchPopups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPopups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchPopups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message;
      })

      // fetchAdminPopups
      .addCase(fetchAdminPopups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminPopups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminList = action.payload;
      })
      .addCase(fetchAdminPopups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message;
      });
  },
});

// Selectors
export const selectPopups = (state) => state.popup?.list || [];
export const selectAdminPopups = (state) => state.popup?.adminList || [];
export const selectPopupLoading = (state) => !!state.popup?.isLoading;
export const selectPopupError = (state) => state.popup?.error || null;

export default slice.reducer;
