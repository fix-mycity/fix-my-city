import { createAsyncThunk } from "@reduxjs/toolkit";
import { getTrafficDashboardComplaintsApi, createTrafficWorkerApi } from "../../api/trafficApi";

export const fetchTrafficComplaints = createAsyncThunk(
  "traffic/fetchComplaints",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getTrafficDashboardComplaintsApi();
      return response.data; // array of complaints
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message || "Failed to fetch complaints");
    }
  }
);

export const createTrafficWorker = createAsyncThunk(
  "traffic/createWorker",
  async (workerData, { rejectWithValue }) => {
    try {
      const response = await createTrafficWorkerApi(workerData);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(error.message || "Failed to create worker");
    }
  }
);
