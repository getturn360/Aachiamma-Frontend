// client/src/store/auth-slice/index.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/**
 * Auth slice (final version)
 *
 * - loginUser → /auth/login
 * - registerUser → /auth/register
 * - checkAuth → /auth/check-auth
 * - logoutUser → clears token + user
 * - token auto-saved to localStorage and attached to axios headers
 */

const API_BASE = "http://localhost:5000/api";

// ensure axios baseURL
axios.defaults.baseURL = API_BASE;

// Normalize saved token (strip accidental quotes) & set default header
let savedToken = null;
try {
  const raw = localStorage.getItem("auth_token");
  if (raw) {
    savedToken = raw.startsWith('"') && raw.endsWith('"') ? raw.slice(1, -1) : raw;
  }
} catch (e) {
  savedToken = null;
}

if (savedToken) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
}

// -------------------- THUNKS --------------------

// ✅ REGISTER USER
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const resp = await axios.post(`/auth/register`, formData);
      return resp.data;
    } catch (err) {
      const payload =
        err?.response?.data || { message: err.message || "Registration failed" };
      return rejectWithValue(payload);
    }
  }
);

// ✅ LOGIN USER (stores token immediately & triggers checkAuth)
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const resp = await axios.post(`/auth/login`, credentials);
      const data = resp.data || {};
      const token = data.token || data?.data?.token || data?.accessToken || null;

      if (token) {
        try {
          localStorage.setItem("auth_token", token);
        } catch (e) {}
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        // trigger server-side validation & user fetch
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

// ✅ CHECK AUTH (explicitly attaches token from localStorage to avoid timing issues)
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      // Read token freshly from localStorage to avoid timing issues
      let token = null;
      try {
        const raw = localStorage.getItem("auth_token");
        if (raw) token = raw.startsWith('"') && raw.endsWith('"') ? raw.slice(1, -1) : raw;
      } catch (e) {
        token = null;
      }

      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // send token explicitly (do not rely only on axios.defaults)
      const resp = await axios.get(`/auth/check-auth`, { headers });
      return resp.data;
    } catch (err) {
      const payload =
        err?.response?.data || { message: err.message || "Auth check failed" };
      return rejectWithValue(payload);
    }
  }
);

// -------------------- SLICE --------------------

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
      } catch (e) {}
      delete axios.defaults.headers.common["Authorization"];
    },
    setUser(state, action) {
      state.user = action.payload || null;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    // REGISTER USER
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
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
          // registration successful but no auto-login
          state.user = user;
          state.isAuthenticated = false;
        }
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
      });

    // LOGIN USER
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
          // store token raw (no JSON.stringify)
          localStorage.setItem("auth_token", token);
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload || action.error || { message: "Login failed" };
      });

    // CHECK AUTH
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
        } catch (e) {}
        delete axios.defaults.headers.common["Authorization"];
        state.token = null;
        state.user = null;
        state.error =
          action.payload || action.error || { message: "Not authenticated" };
      });
  },
});

export const { logoutUser, setUser } = authSlice.actions;
export default authSlice.reducer;
