import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getEmergencyReport } from "../../services/reportService";
import KpiCard from "../../components/waterAuthority/KpiCard";
import ReportFilter from "../../components/waterAuthority/ReportFilter";
import ExportButton from "../../components/waterAuthority/ExportButton";

export default function EmergencyReports() {
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
      const res = await getEmergencyReport(filters);
      setReport(res.data);
    } catch (err) {
      console.error("Failed to fetch emergency report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Emergency Shutdown Analytics
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
            Monitor catastrophic pipe bursts, contamination alerts, and mean emergency response times.
          </p>
        </div>
        <ExportButton reportType="emergency" filters={filters} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', pb: '0.5rem' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '700',
              border: 'none',
              borderBottom: tab.id === "emergency" ? '3px solid #2563eb' : '3px solid transparent',
              backgroundColor: tab.id === "emergency" ? '#eff6ff' : 'transparent',
              color: tab.id === "emergency" ? '#2563eb' : '#64748b',
              cursor: 'pointer'
            }}
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '2.5rem', color: '#dc2626' }}>
            autorenew
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <KpiCard
              title="Active Shutdowns"
              value={report?.summary?.active_emergencies || 0}
              icon="dangerous"
              description="Water flow currently stopped"
              color="rose"
            />
            <KpiCard
              title="Critical Priority"
              value={report?.summary?.critical_emergencies || 0}
              icon="priority_high"
              description="Requires immediate action"
              color="amber"
            />
            <KpiCard
              title="Restored & Closed"
              value={report?.summary?.resolved_emergencies || 0}
              icon="check_circle"
              description="Water supply restored"
              color="emerald"
            />
            <KpiCard
              title="Avg Resolution Duration"
              value={report?.summary?.avg_resolution_time_minutes ? `${report.summary.avg_resolution_time_minutes} mins` : "0 mins"}
              icon="timer"
              description="Mean time to restore supply"
              color="purple"
            />
          </div>
        </div>
      )}
    </div>
  );
}
