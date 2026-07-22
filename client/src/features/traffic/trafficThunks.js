import { createAsyncThunk } from "@reduxjs/toolkit";
import { 
  getTrafficDashboardComplaintsApi, 
  getTrafficDashboardSummaryApi,
  listTrafficIncidentsApi,
  getIncidentByIdApi,
  assignTrafficIncidentApi,
  resolveTrafficIncidentApi,
  closeTrafficIncidentApi,
  updateTrafficIncidentStatusApi,
  listTrafficWorkersApi,
  createTrafficWorkerApi,
  updateTrafficWorkerApi,
  deleteTrafficWorkerApi,
  blockTrafficWorkerApi
} from "../../api/trafficApi";

export const fetchTrafficDashboardSummary = createAsyncThunk(
  "traffic/fetchSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getTrafficDashboardSummaryApi();
      return response.data;
    } catch (error) {
      if (error.response?.data) return rejectWithValue(error.response.data);
      return rejectWithValue(error.message);
    }
  }
);

// Legacy fetch for the monolithic dashboard
export const fetchTrafficComplaints = createAsyncThunk(
  "traffic/fetchComplaints",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getTrafficDashboardComplaintsApi();
      return response.data;
    } catch (error) {
      if (error.response?.data) return rejectWithValue(error.response.data);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTrafficIncidents = createAsyncThunk(
  "traffic/fetchIncidents",
  async (params, { rejectWithValue }) => {
    try {
      const response = await listTrafficIncidentsApi(params);
      return response.data;
    } catch (error) {
      if (error.response?.data) return rejectWithValue(error.response.data);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchIncidentById = createAsyncThunk(
  "traffic/fetchIncidentById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await getIncidentByIdApi(id);
      return response.data;
    } catch (error) {
      if (error.response?.data) return rejectWithValue(error.response.data);
      return rejectWithValue(error.message);
    }
  }
);

export const assignTrafficIncident = createAsyncThunk(
  "traffic/assignIncident",
  async ({ incidentId, workerData }, { rejectWithValue }) => {
    try {
      const response = await assignTrafficIncidentApi(incidentId, workerData);
      return response.data;
    } catch (error) {
      if (error.response?.data) return rejectWithValue(error.response.data);
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
      if (error.response?.data) return rejectWithValue(error.response.data);
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
      if (error.response?.data) return rejectWithValue(error.response.data);
      return rejectWithValue(error.message);
    }
  }
);

export const updateTrafficIncidentStatus = createAsyncThunk(
  "traffic/updateIncidentStatus",
  async ({ incidentId, status }, { rejectWithValue }) => {
    try {
      const response = await updateTrafficIncidentStatusApi(incidentId, { status });
      return response.data;
    } catch (error) {
      if (error.response?.data) return rejectWithValue(error.response.data);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTrafficWorkers = createAsyncThunk(
  "traffic/fetchWorkers",
  async (params, { rejectWithValue }) => {
    try {
      const response = await listTrafficWorkersApi(params);
      return response.data;
    } catch (error) {
      if (error.response?.data) return rejectWithValue(error.response.data);
      return rejectWithValue(error.message);
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
      if (error.response?.data) return rejectWithValue(error.response.data);
      return rejectWithValue(error.message);
    }
  }
);

export const updateTrafficWorker = createAsyncThunk(
  "traffic/updateWorker",
  async ({ workerId, workerData }, { rejectWithValue }) => {
    try {
      const response = await updateTrafficWorkerApi(workerId, workerData);
      return response.data;
    } catch (error) {
      if (error.response?.data) return rejectWithValue(error.response.data);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTrafficWorker = createAsyncThunk(
  "traffic/deleteWorker",
  async (workerId, { rejectWithValue }) => {
    try {
      const response = await deleteTrafficWorkerApi(workerId);
      return response.data;
    } catch (error) {
      if (error.response?.data) return rejectWithValue(error.response.data);
      return rejectWithValue(error.message);
    }
  }
);

export const blockTrafficWorker = createAsyncThunk(
  "traffic/blockWorker",
  async (workerId, { rejectWithValue }) => {
    try {
      const response = await blockTrafficWorkerApi(workerId);
      return response.data;
    } catch (error) {
      if (error.response?.data) return rejectWithValue(error.response.data);
      return rejectWithValue(error.message);
    }
  }
);
