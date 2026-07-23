import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPipelinesReport } from "../../services/reportService";
import KpiCard from "../../components/waterAuthority/KpiCard";
import ReportFilter from "../../components/waterAuthority/ReportFilter";
import ChartContainer from "../../components/waterAuthority/ChartContainer";
import BarChartCard from "../../components/waterAuthority/BarChartCard";
import PipelineStatisticsTable from "../../components/waterAuthority/PipelineStatisticsTable";
import ExportButton from "../../components/waterAuthority/ExportButton";
import ReportCard from "../../components/waterAuthority/ReportCard";

export default function PipelineReports() {
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
      const res = await getPipelinesReport(filters);
      setReport(res.data);
    } catch (err) {
      console.error("Failed to fetch pipelines report:", err);
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
          <h1 className="text-2xl font-bold text-white tracking-wide">Pipelines Diagnostics</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track structural integrity levels, leakage states, and inspection schedules.
          </p>
        </div>
        <ExportButton reportType="pipelines" filters={filters} />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-800/60 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab.id === "pipelines"
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
              title="Registered Pipelines"
              value={report.total_pipelines}
              icon="schema"
              description="Total pipeline network size"
              color="blue"
            />
            <KpiCard
              title="Damaged Pipelines"
              value={report.damaged_pipelines_count}
              icon="broken_image"
              description="Needs emergency repair actions"
              color="rose"
            />
            <KpiCard
              title="Inspections Due"
              value={report.inspections_due_count}
              icon="event_busy"
              description="Awaiting scheduling status"
              color="amber"
            />
          </div>

          <ChartContainer>
            <BarChartCard title="Pipelines by Classification" data={report.by_type} />
            <ReportCard title="Casing Material Stats" subtitle="Casing counts of active lines">
              <div className="space-y-3">
                {Object.keys(report.by_material).map((m, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">{m} Casing</span>
                    <span className="text-white font-semibold">{report.by_material[m]} lines</span>
                  </div>
                ))}
              </div>
            </ReportCard>
          </ChartContainer>

          <ReportCard title="Network Condition Metrics" subtitle="Status of active pipelines integrity">
            <PipelineStatisticsTable conditions={report.by_condition} materials={report.by_material} />
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
