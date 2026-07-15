import { createSlice } from "@reduxjs/toolkit";
import { fetchTrafficComplaints, createTrafficWorker } from "./trafficThunks";

const initialState = {
  complaints: [],
  dashboardStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  dashboardError: null,
  workerCreateStatus: "idle",
  workerCreateError: null,
};

const trafficSlice = createSlice({
  name: "traffic",
  initialState,
  reducers: {
    resetWorkerCreateStatus: (state) => {
      state.workerCreateStatus = "idle";
      state.workerCreateError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchTrafficComplaints
      .addCase(fetchTrafficComplaints.pending, (state) => {
        state.dashboardStatus = "loading";
        state.dashboardError = null;
      })
      .addCase(fetchTrafficComplaints.fulfilled, (state, action) => {
        state.dashboardStatus = "succeeded";
        // The API returns the array directly, or { data: [...] }. 
        // Let's assume it returns an array based on the FastAPI code.
        state.complaints = action.payload; 
      })
      .addCase(fetchTrafficComplaints.rejected, (state, action) => {
        state.dashboardStatus = "failed";
        state.dashboardError = action.payload;
      })
      
      // createTrafficWorker
      .addCase(createTrafficWorker.pending, (state) => {
        state.workerCreateStatus = "loading";
        state.workerCreateError = null;
      })
      .addCase(createTrafficWorker.fulfilled, (state) => {
        state.workerCreateStatus = "succeeded";
      })
      .addCase(createTrafficWorker.rejected, (state, action) => {
        state.workerCreateStatus = "failed";
        state.workerCreateError = action.payload;
      });
  },
});

export const { resetWorkerCreateStatus } = trafficSlice.actions;
export default trafficSlice.reducer;
