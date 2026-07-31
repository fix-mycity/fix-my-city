import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardAnalytics } from "../../services/analyticsService";
import KpiCard from "../../components/waterAuthority/KpiCard";
import ReportFilter from "../../components/waterAuthority/ReportFilter";
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Reports & Analytics Console
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
            Aggregated operational analytics, complaints breakdown, water supply performance, and infrastructure health metrics.
          </p>
        </div>

        <ExportButton reportType="dashboard" filters={filters} />
      </div>

      {/* Navigation Tabs Bar */}
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
              borderBottom: tab.id === "dashboard" ? '3px solid #2563eb' : '3px solid transparent',
              backgroundColor: tab.id === "dashboard" ? '#eff6ff' : 'transparent',
              color: tab.id === "dashboard" ? '#2563eb' : '#64748b',
              cursor: 'pointer'
            }}
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '2.5rem', color: '#2563eb' }}>
            autorenew
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top KPI Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}>
            <KpiCard
              title="Total Complaints"
              value={analytics?.kpis?.total_complaints || 0}
              icon="assignment"
              description="Logged municipal complaints"
              trend={analytics?.kpis?.resolved_complaints ? `${analytics.kpis.resolved_complaints} resolved` : undefined}
              trendType="up"
              color="blue"
            />
            <KpiCard
              title="Avg Resolution Time"
              value={analytics?.kpis?.avg_resolution_hours ? `${analytics.kpis.avg_resolution_hours} hrs` : "0 hrs"}
              icon="timer"
              description="Mean time to close ticket"
              color="purple"
            />
            <KpiCard
              title="Capacity Usage"
              value={analytics?.kpis?.tank_capacity_pct ? `${analytics.kpis.tank_capacity_pct}%` : "0%"}
              icon="propane_tank"
              description="Total reservoir fill percentage"
              trend={analytics?.kpis?.low_level_tanks ? `${analytics.kpis.low_level_tanks} low tanks` : undefined}
              trendType="down"
              color="emerald"
            />
            <KpiCard
              title="Unsafe Water Alerts"
              value={analytics?.kpis?.unsafe_water_alerts || 0}
              icon="biotech"
              description="Contamination warnings logged"
              color="rose"
            />
            <KpiCard
              title="Pipelines Damaged"
              value={analytics?.kpis?.damaged_pipelines || 0}
              icon="schema"
              description="Repair actions required"
              color="rose"
            />
            <KpiCard
              title="Emergency Shutdowns"
              value={analytics?.kpis?.active_emergencies || 0}
              icon="dangerous"
              description="Active ward isolation outages"
              color="amber"
            />
            <KpiCard
              title="Field Worker Crew"
              value={analytics?.kpis?.available_workers !== undefined ? `${analytics.kpis.available_workers}/${analytics.kpis.busy_workers || 0}` : "0/0"}
              icon="engineering"
              description="Available vs Busy crews"
              color="blue"
            />
            <KpiCard
              title="Notifications Sent"
              value={analytics?.kpis?.total_notifications || 0}
              icon="notifications"
              description="Dispatched announcements"
              color="emerald"
            />
          </div>
        </div>
      )}
    </div>
  );
}
