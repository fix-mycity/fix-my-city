import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getWorkersReport } from "../../services/reportService";
import KpiCard from "../../components/waterAuthority/KpiCard";
import ReportFilter from "../../components/waterAuthority/ReportFilter";
import WorkerPerformanceTable from "../../components/waterAuthority/WorkerPerformanceTable";
import ExportButton from "../../components/waterAuthority/ExportButton";
import ReportCard from "../../components/waterAuthority/ReportCard";
import ChartContainer from "../../components/waterAuthority/ChartContainer";
import BarChartCard from "../../components/waterAuthority/BarChartCard";

export default function WorkerReports() {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
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

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await getWorkersReport(filters);
      setReport(res.data);
    } catch (err) {
      console.error("Failed to fetch workers report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters]);

  // Compute stats helper
  const chartData = report?.worker_efficiency
    ? report.worker_efficiency.reduce((acc, w) => {
        acc[w.name] = w.tasks_completed;
        return acc;
      }, {})
    : {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Field Worker Performance</h1>
          <p className="text-slate-400 text-sm mt-1">
            Review assignment loading, task resolution speeds, and crew performance.
          </p>
        </div>
        <ExportButton reportType="workers" filters={filters} />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-800/60 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab.id === "workers"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ReportFilter
        filters={filters}
        onChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
        onClear={() => setFilters({ ward: "", zone: "", start_date: "", end_date: "" })}
        onRefresh={fetchReport}
      />

      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
        </div>
      ) : report ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KpiCard
              title="Total Crews Registered"
              value={report.total_workers}
              icon="groups"
              description="Active technical workers"
              color="blue"
            />
            <KpiCard
              title="Crews Standby / Busy"
              value={`${report.available_workers} / ${report.busy_workers}`}
              icon="engineering"
              description="Current crews availability status"
              color="violet"
            />
            <KpiCard
              title="Crews Utilization Rate"
              value="87.5%"
              icon="insights"
              description="Schedules assignment occupancy"
              color="emerald"
            />
          </div>

          <ChartContainer>
            <BarChartCard title="Completed Tasks count by Worker" data={chartData} />
            <ReportCard title="Top Performing Workers" subtitle="Crews with highest verified counts">
              <div className="space-y-4">
                {report.top_performing.map((top, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-white font-medium">{idx + 1}. {top.name}</span>
                    <span className="text-emerald-450 font-bold font-mono">{top.tasks_completed} tasks completed</span>
                  </div>
                ))}
              </div>
            </ReportCard>
          </ChartContainer>

          <ReportCard title="Crews Efficiency Statistics" subtitle="Overview of resolve speed and load ratings">
            <WorkerPerformanceTable workers={report.worker_efficiency} />
          </ReportCard>
        </>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-slate-500">
          No Reports Available
        </div>
      )}
    </div>
  );
}
