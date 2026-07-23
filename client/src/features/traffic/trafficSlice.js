import { createSlice } from "@reduxjs/toolkit";
import { 
  fetchTrafficComplaints,
  fetchTrafficDashboardSummary,
  fetchTrafficIncidents,
  fetchIncidentById,
  assignTrafficIncident,
  resolveTrafficIncident,
  closeTrafficIncident,
  fetchTrafficWorkers,
  createTrafficWorker,
  deleteTrafficWorker,
  updateTrafficIncidentStatus,
  updateTrafficWorker
} from "./trafficThunks";

const initialState = {
  // Legacy / Basic Dashboard
  complaints: [],
  dashboardStatus: "idle", 
  dashboardError: null,
  
  // Dashboard Summary
  dashboardSummary: null,
  summaryStatus: "idle",
  summaryError: null,

  // Incidents
  incidents: {
    items: [],
    total_items: 0,
    page: 1,
    page_size: 10,
    total_pages: 1
  },
  incidentsStatus: "idle",
  incidentsError: null,

  currentIncident: null,
  currentIncidentStatus: "idle",

  // Workers
  workers: {
    items: [],
    total_items: 0,
    page: 1,
    page_size: 10,
    total_pages: 1
  },
  workersStatus: "idle",
  workersError: null,

  workerCreateStatus: "idle",
  workerCreateError: null,
  
  workerDeleteStatus: "idle",
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
      // Dashboard Summary
      .addCase(fetchTrafficDashboardSummary.pending, (state) => {
        state.summaryStatus = "loading";
      })
      .addCase(fetchTrafficDashboardSummary.fulfilled, (state, action) => {
        state.summaryStatus = "succeeded";
        state.dashboardSummary = action.payload;
      })
      .addCase(fetchTrafficDashboardSummary.rejected, (state, action) => {
        state.summaryStatus = "failed";
        state.summaryError = action.payload;
      })

      // Legacy fetchTrafficComplaints
      .addCase(fetchTrafficComplaints.pending, (state) => {
        state.dashboardStatus = "loading";
        state.dashboardError = null;
      })
      .addCase(fetchTrafficComplaints.fulfilled, (state, action) => {
        state.dashboardStatus = "succeeded";
        state.complaints = action.payload; 
      })
      .addCase(fetchTrafficComplaints.rejected, (state, action) => {
        state.dashboardStatus = "failed";
        state.dashboardError = action.payload;
      })

      // fetchTrafficIncidents
      .addCase(fetchTrafficIncidents.pending, (state) => {
        state.incidentsStatus = "loading";
      })
      .addCase(fetchTrafficIncidents.fulfilled, (state, action) => {
        state.incidentsStatus = "succeeded";
        state.incidents = action.payload;
      })
      .addCase(fetchTrafficIncidents.rejected, (state, action) => {
        state.incidentsStatus = "failed";
        state.incidentsError = action.payload;
      })

      // fetchIncidentById
      .addCase(fetchIncidentById.pending, (state) => {
        state.currentIncidentStatus = "loading";
      })
      .addCase(fetchIncidentById.fulfilled, (state, action) => {
        state.currentIncidentStatus = "succeeded";
        state.currentIncident = action.payload;
      })
      .addCase(fetchIncidentById.rejected, (state) => {
        state.currentIncidentStatus = "failed";
      })

      // fetchTrafficWorkers
      .addCase(fetchTrafficWorkers.pending, (state) => {
        state.workersStatus = "loading";
      })
      .addCase(fetchTrafficWorkers.fulfilled, (state, action) => {
        state.workersStatus = "succeeded";
        state.workers = action.payload;
      })
      .addCase(fetchTrafficWorkers.rejected, (state, action) => {
        state.workersStatus = "failed";
        state.workersError = action.payload;
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
      })

      // updateTrafficWorker
      .addCase(updateTrafficWorker.pending, (state) => {
        state.workerCreateStatus = "loading";
        state.workerCreateError = null;
      })
      .addCase(updateTrafficWorker.fulfilled, (state) => {
        state.workerCreateStatus = "succeeded";
      })
      .addCase(updateTrafficWorker.rejected, (state, action) => {
        state.workerCreateStatus = "failed";
        state.workerCreateError = action.payload;
      })

      // deleteTrafficWorker
      .addCase(deleteTrafficWorker.pending, (state) => {
        state.workerDeleteStatus = "loading";
      })
      .addCase(deleteTrafficWorker.fulfilled, (state) => {
        state.workerDeleteStatus = "succeeded";
      })
      .addCase(deleteTrafficWorker.rejected, (state) => {
        state.workerDeleteStatus = "failed";
      })

      // Incident actions
      .addCase(assignTrafficIncident.fulfilled, (state, action) => {
        const updatedIncident = action.payload;
        
        // Update legacy array
        let idx = state.complaints.findIndex(c => c.id === updatedIncident.id);
        if (idx !== -1) state.complaints[idx] = updatedIncident;

        // Update incidents array
        idx = state.incidents.items.findIndex(c => c.id === updatedIncident.id);
        if (idx !== -1) state.incidents.items[idx] = updatedIncident;

        if (state.currentIncident?.id === updatedIncident.id) {
          state.currentIncident = updatedIncident;
        }
      })
      .addCase(resolveTrafficIncident.fulfilled, (state, action) => {
        const updatedIncident = action.payload;
        let idx = state.complaints.findIndex(c => c.id === updatedIncident.id);
        if (idx !== -1) state.complaints[idx] = updatedIncident;
        idx = state.incidents.items.findIndex(c => c.id === updatedIncident.id);
        if (idx !== -1) state.incidents.items[idx] = updatedIncident;
        if (state.currentIncident?.id === updatedIncident.id) state.currentIncident = updatedIncident;
      })
      .addCase(closeTrafficIncident.fulfilled, (state, action) => {
        const updatedIncident = action.payload;
        let idx = state.complaints.findIndex(c => c.id === updatedIncident.id);
        if (idx !== -1) state.complaints[idx] = updatedIncident;
        idx = state.incidents.items.findIndex(c => c.id === updatedIncident.id);
        if (idx !== -1) state.incidents.items[idx] = updatedIncident;
        if (state.currentIncident?.id === updatedIncident.id) state.currentIncident = updatedIncident;
      })
      .addCase(updateTrafficIncidentStatus.fulfilled, (state, action) => {
        const updatedIncident = action.payload;
        let idx = state.complaints.findIndex(c => c.id === updatedIncident.id);
        if (idx !== -1) state.complaints[idx] = updatedIncident;
        idx = state.incidents.items.findIndex(c => c.id === updatedIncident.id);
        if (idx !== -1) state.incidents.items[idx] = updatedIncident;
        if (state.currentIncident?.id === updatedIncident.id) state.currentIncident = updatedIncident;
      });
  },
});

export const { resetWorkerCreateStatus } = trafficSlice.actions;
export default trafficSlice.reducer;
