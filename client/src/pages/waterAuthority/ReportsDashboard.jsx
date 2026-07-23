import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardAnalytics } from "../../services/analyticsService";
import KpiCard from "../../components/waterAuthority/KpiCard";
import ReportFilter from "../../components/waterAuthority/ReportFilter";
import ChartContainer from "../../components/waterAuthority/ChartContainer";
import LineChartCard from "../../components/waterAuthority/LineChartCard";
import BarChartCard from "../../components/waterAuthority/BarChartCard";
import PieChartCard from "../../components/waterAuthority/PieChartCard";
import ExportButton from "../../components/waterAuthority/ExportButton";

export default function ReportsDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    ward: "",
    zone: "",
    start_date: "",
    end_date: ""
  });

  const tabs = [
    { id: "dashboard", label: "Dashboard", path: "/water/reports" },
    { id: "complaints", label: "Complaints", path: "/water/reports/complaints" },
    { id: "workers", label: "Workers", path: "/water/reports/workers" },
    { id: "supply", label: "Water Supply", path: "/water/reports/supply" },
    { id: "pipelines", label: "Pipelines", path: "/water/reports/pipelines" },
    { id: "tanks", label: "Tanks", path: "/water/reports/tanks" },
    { id: "quality", label: "Quality", path: "/water/reports/quality" },
    { id: "maintenance", label: "Maintenance", path: "/water/reports/maintenance" },
    { id: "emergency", label: "Emergency", path: "/water/reports/emergency" },
    { id: "notifications", label: "Notifications", path: "/water/reports/notifications" },
  ];

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await getDashboardAnalytics(filters);
      setAnalytics(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard reports analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({ ward: "", zone: "", start_date: "", end_date: "" });
  };

  return (
    <div className="space-y-6">
      {/* Upper Navigation Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Reports & Analytics Console</h1>
          <p className="text-slate-400 text-sm mt-1">
            General metrics aggregator across all municipal water operations.
          </p>
        </div>
        <ExportButton reportType="dashboard" filters={filters} />
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex flex-wrap gap-1 border-b border-slate-800/60 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab.id === "dashboard"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Row */}
      <ReportFilter
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        onRefresh={fetchAnalytics}
      />

      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : analytics ? (
        <>
          {/* Main KPIs Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard
              title="Total Complaints"
              value={analytics.total_complaints}
              icon="assignment"
              description="Total logged cases"
              trend={`${analytics.resolved_complaints} resolved`}
              trendType="up"
              color="blue"
            />
            <KpiCard
              title="Avg Resolution Time"
              value={`${analytics.avg_resolution_time_hours} hrs`}
              icon="timer"
              description="Mean hours to close"
              color="violet"
            />
            <KpiCard
              title="Capacity Usage"
              value={`${analytics.tank_capacity_usage_pct}%`}
              icon="propane_tank"
              description="Total water levels reserves"
              trend={`${analytics.low_water_tanks} low tanks`}
              trendType="warning"
              color="emerald"
            />
            <KpiCard
              title="Unsafe Water Alerts"
              value={analytics.unsafe_water_reports}
              icon="biotech"
              description="Contamination warning reports"
              trendType="down"
              color="rose"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard
              title="Pipelines Damaged"
              value={analytics.damaged_pipelines}
              icon="schema"
              description="Repair actions required"
              trend={`${analytics.inspections_due} due`}
              trendType="neutral"
              color="rose"
            />
            <KpiCard
              title="Emergency Shutdowns"
              value={analytics.emergency_shutdowns}
              icon="dangerous"
              description="Active ward isolation outages"
              color="orange"
            />
            <KpiCard
              title="Field Worker Crew"
              value={`${analytics.workers_available} / ${analytics.workers_busy}`}
              icon="engineering"
              description="Available vs Busy crews"
              color="blue"
            />
            <KpiCard
              title="Notifications Sent"
              value={analytics.notifications_sent}
              icon="notifications"
              description="Dispatched announcements"
              color="emerald"
            />
          </div>

          {/* Visual Trend Charts Grid */}
          <ChartContainer>
            <LineChartCard title="Monthly Complaints Trend" data={analytics.monthly_complaints_trend} />
            <PieChartCard title="Complaints by Category" data={analytics.complaints_by_category} />
          </ChartContainer>

          <ChartContainer>
            <BarChartCard title="Complaints by Ward Distribution" data={analytics.complaints_by_ward} />
            <BarChartCard title="Complaints Status Breakdown" data={analytics.complaints_by_status} />
          </ChartContainer>
        </>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-slate-500">
          No Analytics Data Available
        </div>
      )}
    </div>
  );
}
