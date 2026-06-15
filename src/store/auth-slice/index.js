import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api/axios";

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const resp = await api.post("/api/auth/register", formData);
      return resp.data;
    } catch (err) {
      const payload =
        err?.response?.data || { message: err.message || "Registration failed" };
      return rejectWithValue(payload);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const resp = await api.post("/api/auth/login", credentials);
      return resp.data;
    } catch (err) {
      const payload =
        err?.response?.data || { message: err.message || "Login failed" };
      return rejectWithValue(payload);
    }
  }
);

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const resp = await api.get("/api/auth/check-auth", { skipGlobalLoader: true });
      return resp.data;
    } catch (err) {
      const payload =
        err?.response?.data || { message: err.message || "Auth check failed" };
      return rejectWithValue(payload);
    }
  }
);

export const logoutAsync = createAsyncThunk(
  "auth/logoutAsync",
  async (_, { dispatch }) => {
    try {
      await api.post("/api/auth/logout");
      dispatch(logoutUser());
    } catch (err) {
      dispatch(logoutUser());
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    isAuthenticated: false,
    error: null,
  },
  reducers: {
    logoutUser(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      try {
        sessionStorage.removeItem("popup_seen_this_session");
      } catch {
        // ignore
      }
    },
    setUser(state, action) {
      state.user = action.payload || null;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        const user =
          payload.user || payload?.data?.user || payload?.data || null;

        if (user) {
          state.user = user;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
      });

    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        const user =
          payload.user || payload?.data?.user || payload?.data || null;

        state.user = user || null;
        state.isAuthenticated = !!user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload || action.error || { message: "Login failed" };
      });

    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        const user =
          payload.user || payload?.data?.user || payload?.data || null;
        state.user = user;
        state.isAuthenticated = !!user;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error =
          action.payload || action.error || { message: "Not authenticated" };
      });
  },
});

export const { logoutUser, setUser } = authSlice.actions;
export default authSlice.reducer;
