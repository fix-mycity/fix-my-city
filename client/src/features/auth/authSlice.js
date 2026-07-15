import { createSlice } from "@reduxjs/toolkit";
import {
  registerUser,
  verifyOtp,
  loginUser,
  fetchCurrentUser,
  refreshTokens,
  logoutUser,
  resendOtp,
  forgotPassword,
  resetPassword,
} from "./authThunks";

const initialState = {
  user: null,
  isAuthenticated: false,
  registeredEmail: null,
  forgotPasswordEmail: null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.registeredEmail = action.payload.data.email;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // verifyOtp
      .addCase(verifyOtp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      //resend otp
      .addCase(resendOtp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // forgotPassword
      .addCase(forgotPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.forgotPasswordEmail = action.meta.arg.email;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // resetPassword
      .addCase(resetPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = "succeeded";
        state.forgotPasswordEmail = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
        if (action.payload.data.user?.permissions) {
          localStorage.setItem("user_permissions", JSON.stringify(action.payload.data.user.permissions));
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // fetchCurrentUser
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        const storedPermissions = JSON.parse(localStorage.getItem("user_permissions") || "[]");
        state.user = {
          ...action.payload.data.user,
          permissions: action.payload.data.user?.permissions || storedPermissions
        };
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.status = "idle";
        state.user = null;
        state.isAuthenticated = false;
      })

      // refreshTokens
      .addCase(refreshTokens.fulfilled, (state) => {
        state.isAuthenticated = true;
      })
      .addCase(refreshTokens.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })

      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = "idle";
        state.error = null;
        localStorage.removeItem("user_permissions");
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = "idle";
      });
  },
});

export default authSlice.reducer;
