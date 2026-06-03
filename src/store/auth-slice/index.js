import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { setAuthToken, clearAuthToken } from "@/api/axios";

let savedToken = null;
try {
  const raw = localStorage.getItem("auth_token");
  if (raw) {
    savedToken = raw.startsWith('"') && raw.endsWith('"') ? raw.slice(1, -1) : raw;
  }
} catch {
  savedToken = null;
}

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
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const resp = await api.post("/api/auth/login", credentials);
      const data = resp.data || {};
      const token = data.token || data?.data?.token || data?.accessToken || null;

      if (token) {
        try {
          localStorage.setItem("auth_token", token);
        } catch {
          // ignore
        }
        setAuthToken(token);
        dispatch(checkAuth());
      }

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
      const resp = await api.get("/api/auth/check-auth");
      return resp.data;
    } catch (err) {
      const payload =
        err?.response?.data || { message: err.message || "Auth check failed" };
      return rejectWithValue(payload);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: savedToken || null,
    loading: false,
    isAuthenticated: !!savedToken,
    error: null,
  },
  reducers: {
    logoutUser(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      try {
        localStorage.removeItem("auth_token");
      } catch {
        // ignore
      }
      clearAuthToken();
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
        const token =
          payload.token || payload?.data?.token || payload?.accessToken || null;
        const user =
          payload.user || payload?.data?.user || payload?.data || null;

        if (token) {
          state.token = token;
          state.user = user;
          state.isAuthenticated = true;
          localStorage.setItem("auth_token", token);
          setAuthToken(token);
        } else {
          state.user = user;
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
        const token =
          payload.token || payload?.data?.token || payload?.accessToken || null;
        const user =
          payload.user || payload?.data?.user || payload?.data || null;

        state.token = token || null;
        state.user = user || null;
        state.isAuthenticated = !!token || !!user;
        state.error = null;

        if (token) {
          localStorage.setItem("auth_token", token);
          setAuthToken(token);
        }
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
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        try {
          localStorage.removeItem("auth_token");
        } catch {
          // ignore
        }
        clearAuthToken();
        state.token = null;
        state.user = null;
        state.error =
          action.payload || action.error || { message: "Not authenticated" };
      });
  },
});

export const { logoutUser, setUser } = authSlice.actions;
export default authSlice.reducer;
