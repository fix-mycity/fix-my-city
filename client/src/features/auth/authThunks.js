import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  registerApi,
  verifyOtpApi,
  loginApi,
  getMeApi,
  refreshApi,
  logoutApi,
  sendOtpApi,
  forgotPasswordApi,
  resetPasswordApi,
} from "../../api/authApi";

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (data, { rejectWithValue }) => {
    try {
      const response = await registerApi(data);
      return response.data;
    } catch (error) {
      // SAFE RETURN: Pass the exact FastAPI error object back to the component
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data); // This returns {"detail": "Email already exists"}
      }
      
      // Fallback for network issues (e.g., server offline)
      return rejectWithValue(error.message || "Network Error");
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (data, { rejectWithValue }) => {
    try {
      const response = await verifyOtpApi(data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }

      return rejectWithValue(error.message || "OTP verification failed.");
    }
  },
);

export const resendOtp = createAsyncThunk(
  "auth/resendOtp",
  async (data, { rejectWithValue }) => {
    try {
      const response = await sendOtpApi(data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }

      return rejectWithValue(error.message || "Failed to resend OTP.");
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (data, { rejectWithValue }) => {
    try {
      const response = await loginApi(data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }

      return rejectWithValue(error.message || "Login failed.");
    }
  },
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMeApi();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Not authenticated.",
      );
    }
  },
);

export const refreshTokens = createAsyncThunk(
  "auth/refreshTokens",
  async (_, { rejectWithValue }) => {
    try {
      const response = await refreshApi();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Token refresh failed.",
      );
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (data, { rejectWithValue }) => {
    try {
      const response = await forgotPasswordApi(data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }

      return rejectWithValue(error.message || "Failed to send reset OTP.");
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data, { rejectWithValue }) => {
    try {
      const response = await resetPasswordApi(data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }

      return rejectWithValue(error.message || "Password reset failed.");
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await logoutApi();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Logout failed.");
    }
  },
);
