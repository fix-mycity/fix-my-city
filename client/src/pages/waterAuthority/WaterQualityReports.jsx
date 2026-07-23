import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getQualityReport } from "../../services/reportService";
import KpiCard from "../../components/waterAuthority/KpiCard";
import ReportFilter from "../../components/waterAuthority/ReportFilter";
import QualityStatisticsTable from "../../components/waterAuthority/QualityStatisticsTable";
import ExportButton from "../../components/waterAuthority/ExportButton";
import ReportCard from "../../components/waterAuthority/ReportCard";

export default function WaterQualityReports() {
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
      const res = await getQualityReport(filters);
      setReport(res.data);
    } catch (err) {
      console.error("Failed to fetch quality report:", err);
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
          <h1 className="text-2xl font-bold text-white tracking-wide">Water Quality Monitoring</h1>
          <p className="text-slate-400 text-sm mt-1">
            Review pH standards compliance, TDS levels, and bacteriological contamination alerts.
          </p>
        </div>
        <ExportButton reportType="quality" filters={filters} />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-800/60 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab.id === "quality"
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
              title="Quality Tests Registered"
              value={report.total_reports}
              icon="biotech"
              description="Laboratory samples registered"
              color="blue"
            />
            <KpiCard
              title="Unsafe Warning Alerts"
              value={report.unsafe_reports_count}
              icon="dangerous"
              description="Tests violating safety standards"
              color="rose"
            />
            <KpiCard
              title="Safe Samples Rating"
              value={`${((report.safe_reports_count / (report.total_reports || 1)) * 100).toFixed(1)}%`}
              icon="verified"
              description="SLA purity index score"
              color="emerald"
            />
          </div>

          <ReportCard title="Purity Standards Metrics" subtitle="Overview of pH, TDS, and safety tests status">
            <QualityStatisticsTable
              safe={report.safe_reports_count}
              warning={report.warning_reports_count}
              unsafe={report.unsafe_reports_count}
              avgPh={report.avg_ph_level}
              avgTds={report.avg_tds_level}
            />
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
