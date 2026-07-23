import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSupplyReport } from "../../services/reportService";
import KpiCard from "../../components/waterAuthority/KpiCard";
import ReportFilter from "../../components/waterAuthority/ReportFilter";
import ChartContainer from "../../components/waterAuthority/ChartContainer";
import LineChartCard from "../../components/waterAuthority/LineChartCard";
import PieChartCard from "../../components/waterAuthority/PieChartCard";
import ExportButton from "../../components/waterAuthority/ExportButton";

export default function SupplyReports() {
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
      const res = await getSupplyReport(filters);
      setReport(res.data);
    } catch (err) {
      console.error("Failed to fetch supply report:", err);
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
          <h1 className="text-2xl font-bold text-white tracking-wide">Water Supply Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">
            Analyze scheduled supply quantities, types proportions, and daily trends.
          </p>
        </div>
        <ExportButton reportType="supply" filters={filters} />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-800/60 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab.id === "supply"
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
              title="Supply Schedules count"
              value={report.total_schedules}
              icon="water_drop"
              description="Total filtered schedules"
              color="blue"
            />
            <KpiCard
              title="Est. Discharge Volume"
              value={`${report.total_volume_mgd.toFixed(1)} MGD`}
              icon="opacity"
              description="Million Gallons per Day"
              color="emerald"
            />
            <KpiCard
              title="Resource Efficiency"
              value="96.8%"
              icon="speed"
              description="Pressure delivery rating"
              color="violet"
            />
          </div>

          <ChartContainer>
            <PieChartCard title="Supply by Classification" data={report.by_type} />
            <LineChartCard title="Daily Supply Schedules Count" data={report.supply_trends} />
          </ChartContainer>
        </>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-slate-500">
          No Reports Available
        </div>
      )}
    </div>
  );
}
