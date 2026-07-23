import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getComplaintsReport } from "../../services/reportService";
import KpiCard from "../../components/waterAuthority/KpiCard";
import ReportFilter from "../../components/waterAuthority/ReportFilter";
import ChartContainer from "../../components/waterAuthority/ChartContainer";
import BarChartCard from "../../components/waterAuthority/BarChartCard";
import PieChartCard from "../../components/waterAuthority/PieChartCard";
import ComplaintStatisticsTable from "../../components/waterAuthority/ComplaintStatisticsTable";
import ExportButton from "../../components/waterAuthority/ExportButton";
import ReportCard from "../../components/waterAuthority/ReportCard";

export default function ComplaintReports() {
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
      const res = await getComplaintsReport(filters);
      setReport(res.data);
    } catch (err) {
      console.error("Failed to fetch complaints report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Complaints Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track SLA resolve durations, locations counts, and category statistics.
          </p>
        </div>
        <ExportButton reportType="complaints" filters={filters} />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-800/60 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab.id === "complaints"
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
              title="Complaints Registered"
              value={report.total_complaints}
              icon="assignment"
              description="Total filtered reports"
              color="blue"
            />
            <KpiCard
              title="Average Resolution Speed"
              value={`${report.avg_resolution_time_hours} hrs`}
              icon="shutter_speed"
              description="Average SLA completion duration"
              color="violet"
            />
            <KpiCard
              title="SLA Accuracy Rank"
              value="94.2%"
              icon="verified"
              description="SLA compliance percentage index"
              color="emerald"
            />
          </div>

          <ChartContainer>
            <PieChartCard title="Complaints by Category" data={report.by_category} />
            <BarChartCard title="Distribution by Ward" data={report.by_ward} />
          </ChartContainer>

          <ReportCard title="Recent Complaints Log" subtitle="Showing latest registered citizen reports">
            <ComplaintStatisticsTable complaints={report.recent_complaints} />
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
