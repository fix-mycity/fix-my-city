import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getNotificationReport } from "../../services/reportService";
import KpiCard from "../../components/waterAuthority/KpiCard";
import ReportFilter from "../../components/waterAuthority/ReportFilter";
import ExportButton from "../../components/waterAuthority/ExportButton";

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
      const res = await getNotificationReport(filters);
      setReport(res.data);
    } catch (err) {
      console.error("Failed to fetch notification report:", err);
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
            Notification & Broadcast Analytics
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
            Monitor citizen broadcast delivery rates, channel reach, and emergency alert dispatches.
          </p>
        </div>
        <ExportButton reportType="notifications" filters={filters} />
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
              borderBottom: tab.id === "notifications" ? '3px solid #2563eb' : '3px solid transparent',
              backgroundColor: tab.id === "notifications" ? '#eff6ff' : 'transparent',
              color: tab.id === "notifications" ? '#2563eb' : '#64748b',
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
          <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '2.5rem', color: '#2563eb' }}>
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
              title="Total Dispatches"
              value={report?.summary?.total_notifications || 0}
              icon="send"
              description="Broadcast dispatches"
              color="blue"
            />
            <KpiCard
              title="Sent / Delivered"
              value={report?.summary?.sent || 0}
              icon="check_circle"
              description="Delivered to citizens"
              color="emerald"
            />
            <KpiCard
              title="Scheduled Slots"
              value={report?.summary?.scheduled || 0}
              icon="schedule"
              description="Scheduled for future"
              color="amber"
            />
            <KpiCard
              title="Emergency Broadcasts"
              value={report?.summary?.emergency_notifications || 0}
              icon="warning"
              description="Emergency alerts"
              color="rose"
            />
          </div>
        </div>
      )}
    </div>
  );
}
