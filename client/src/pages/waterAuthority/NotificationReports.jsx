import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getNotificationsReport } from "../../services/reportService";
import KpiCard from "../../components/waterAuthority/KpiCard";
import ReportFilter from "../../components/waterAuthority/ReportFilter";
import NotificationStatisticsTable from "../../components/waterAuthority/NotificationStatisticsTable";
import ExportButton from "../../components/waterAuthority/ExportButton";
import ReportCard from "../../components/waterAuthority/ReportCard";

export default function NotificationReports() {
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
      const res = await getNotificationsReport(filters);
      setReport(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications report:", err);
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
          <h1 className="text-2xl font-bold text-white tracking-wide">Notifications Broadcast</h1>
          <p className="text-slate-400 text-sm mt-1">
            Review delivery channels success metrics and manual/auto templates ratios.
          </p>
        </div>
        <ExportButton reportType="notifications" filters={filters} />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-800/60 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab.id === "notifications"
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
              title="Dispatched Bulletins"
              value={report.total_sent}
              icon="notifications"
              description="Total sent messages"
              color="blue"
            />
            <KpiCard
              title="Delivery Success"
              value={`${report.delivery_success_rate}%`}
              icon="mark_email_read"
              description="SLA delivery accuracy rating"
              color="emerald"
            />
            <KpiCard
              title="Coverage Ward Reach"
              value="100%"
              icon="public"
              description="Citywide broadcasting coverage"
              color="violet"
            />
          </div>

          <ReportCard title="Broadcasting Channels Performance" subtitle="Alerts totals and delivery success rates">
            <NotificationStatisticsTable
              totalSent={report.total_sent}
              successRate={report.delivery_success_rate}
              byChannel={report.by_channel}
              byType={report.by_type}
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
