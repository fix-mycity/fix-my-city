import { createAsyncThunk } from "@reduxjs/toolkit";
import { 
  getTrafficDashboardComplaintsApi, 
  createTrafficWorkerApi,
  assignTrafficIncidentApi,
  resolveTrafficIncidentApi,
  closeTrafficIncidentApi
} from "../../api/trafficApi";

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

export const assignTrafficIncident = createAsyncThunk(
  "traffic/assignIncident",
  async ({ incidentId, workerData }, { rejectWithValue }) => {
    try {
      const response = await assignTrafficIncidentApi(incidentId, workerData);
      return response.data; // the updated incident
    } catch (error) {
      if (error.response && error.response.data) return rejectWithValue(error.response.data);
      return rejectWithValue(error.message);
    }
  }
);

export const resolveTrafficIncident = createAsyncThunk(
  "traffic/resolveIncident",
  async ({ incidentId, reportData }, { rejectWithValue }) => {
    try {
      const response = await resolveTrafficIncidentApi(incidentId, reportData);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) return rejectWithValue(error.response.data);
      return rejectWithValue(error.message);
    }
  }
);

export const closeTrafficIncident = createAsyncThunk(
  "traffic/closeIncident",
  async (incidentId, { rejectWithValue }) => {
    try {
      const response = await closeTrafficIncidentApi(incidentId);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) return rejectWithValue(error.response.data);
      return rejectWithValue(error.message);
    }
  }
);

