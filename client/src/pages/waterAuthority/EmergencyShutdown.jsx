import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import EmergencyCard from '../../components/waterAuthority/EmergencyCard';
import EmergencyTable from '../../components/waterAuthority/EmergencyTable';
import EmergencyFilter from '../../components/waterAuthority/EmergencyFilter';
import EmergencySearch from '../../components/waterAuthority/EmergencySearch';
import RestoreSupplyDialog from '../../components/waterAuthority/RestoreSupplyDialog';

import { getEmergencies, deleteEmergency, getEmergencyDashboard, updateEmergencyStatus, updateEmergency } from '../../services/emergencyService';

export default function EmergencyShutdown() {
  const navigate = useNavigate();

  // Data states
  const [emergencies, setEmergencies] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Stats
  const [dashboardStats, setDashboardStats] = useState({
    active_emergencies: 0,
    resolved_emergencies: 0,
    critical_emergencies: 0,
    affected_areas_count: 0,
    affected_citizens: 0,
    avg_resolution_time_minutes: 0
  });

  // Search & Filters
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    priority: null,
    status: null,
    emergency_type: null,
    ward: null,
    zone: null
  });

  // Restoring state
  const [restoreId, setRestoreId] = useState(null);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [restoreTitle, setRestoreTitle] = useState("Restore Water Supply");
  const [targetStatus, setTargetStatus] = useState("RESTORED");

  const fetchEmergencies = async () => {
    setIsLoading(true);
    try {
      const response = await getEmergencies({
        page,
        page_size: 10,
        search: search || undefined,
        priority: filters.priority || undefined,
        status: filters.status || undefined,
        emergency_type: filters.emergency_type || undefined,
        ward: filters.ward || undefined,
        zone: filters.zone || undefined
      });

      // Filter out CLOSED if they are on dashboard view, or keep them. 
      // The history page can be dedicated to showing closed, 
      // but let the main page show all that match search/filters.
      setEmergencies(response.data.items);
      setTotalItems(response.data.total_items);
      setTotalPages(response.data.total_pages);
    } catch (err) {
      toast.error("Failed to load emergency records.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await getEmergencyDashboard();
      setDashboardStats(response.data);
    } catch (err) {
      console.error("Could not fetch dashboard statistics:", err);
    }
  };

  useEffect(() => {
    fetchEmergencies();
  }, [page, search, filters]);

  useEffect(() => {
    fetchDashboardStats();
  }, [emergencies]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      priority: null,
      status: null,
      emergency_type: null,
      ward: null,
      zone: null
    });
    setSearch('');
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this emergency shutdown record? All associated timelines and logs will be lost.")) {
      try {
        await deleteEmergency(id);
        toast.success("Emergency record deleted successfully.");
        fetchEmergencies();
      } catch (err) {
        toast.error("Failed to delete record.");
      }
    }
  };

  const handleOpenRestore = (id) => {
    setRestoreId(id);
    setTargetStatus("RESTORED");
    setRestoreTitle("Restore Water Supply");
    setIsRestoreOpen(true);
  };

  const handleOpenClose = (id) => {
    setRestoreId(id);
    setTargetStatus("CLOSED");
    setRestoreTitle("Close Incident");
    setIsRestoreOpen(true);
  };

  const handleStatusUpdateConfirm = async (remarks) => {
    try {
      await updateEmergency(restoreId, {
        status: targetStatus,
        remarks: remarks
      });
      toast.success(`Incident transitioned to ${targetStatus}`);
      fetchEmergencies();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid status transition.");
    }
  };

  // Compute stats helper
  const countAffectedPipes = () => {
    return emergencies.filter(e => e.affected_pipeline_id !== null).length;
  };

  const countAffectedTanks = () => {
    return emergencies.filter(e => e.affected_tank_id !== null).length;
  };

  const countWorkersAssigned = () => {
    return emergencies.reduce((sum, e) => sum + (e.teams ? e.teams.length : 0), 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--water-text)' }}>
            Emergency Shutdown Control Center
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--water-text-muted)', marginTop: '0.2rem' }}>
            Declare pipe bursts, major leakages, or tank contamination alerts, stop water flow, and dispatch crew.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => navigate('/water/emergency/history')}
            className="water-btn"
            style={{ borderColor: 'var(--water-border)', color: 'var(--water-text)', fontWeight: '700' }}
          >
            Incident Logs History
          </button>
          <button 
            onClick={() => navigate('/water/emergency/new')}
            className="water-btn"
            style={{ backgroundColor: 'var(--water-primary)', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}
          >
            <span className="material-symbols-outlined">add_circle</span>
            Declare Shutdown
          </button>
        </div>
      </div>

      {/* Dashboard KPI statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem'
      }}>
        <EmergencyCard title="Active Incidents" value={dashboardStats.active_emergencies} icon="running_with_errors" color="#e74c3c" subtitle="In progress status" />
        <EmergencyCard title="Critical Priority" value={dashboardStats.critical_emergencies} icon="priority_high" color="#c0392b" subtitle="Requires immediate response" />
        <EmergencyCard title="Affected Wards" value={dashboardStats.affected_areas_count} icon="map" color="var(--water-primary)" />
        <EmergencyCard title="Affected Pipelines" value={countAffectedPipes()} icon="schema" color="#9b59b6" />
        <EmergencyCard title="Affected Tanks" value={countAffectedTanks()} icon="propane_tank" color="var(--water-primary-light)" />
        <EmergencyCard title="Crew Responders" value={countWorkersAssigned()} icon="engineering" color="#16a085" />
      </div>

      {/* Visual Analytics SVG Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Trend of Monthly Emergencies line chart */}
        <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '230px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
            Monthly Incidents Trend (Yearly)
          </h3>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <svg width="300" height="130" viewBox="0 0 300 130">
              {/* Grid Lines */}
              <line x1="30" y1="20" x2="280" y2="20" stroke="var(--water-border)" strokeDasharray="3" />
              <line x1="30" y1="60" x2="280" y2="60" stroke="var(--water-border)" strokeDasharray="3" />
              <line x1="30" y1="100" x2="280" y2="100" stroke="var(--water-border)" strokeWidth="2" />
              <line x1="30" y1="10" x2="30" y2="100" stroke="var(--water-border)" strokeWidth="2" />

              {/* Data path line (Trend Line) */}
              <path 
                d="M 30,90 L 70,80 L 110,95 L 150,45 L 190,60 L 230,25 L 280,35" 
                fill="none" 
                stroke="#e74c3c" 
                strokeWidth="3" 
              />

              {/* Dots */}
              <circle cx="30" cy="90" r="4" fill="#e74c3c" />
              <circle cx="70" cy="80" r="4" fill="#e74c3c" />
              <circle cx="110" cy="95" r="4" fill="#e74c3c" />
              <circle cx="150" cy="45" r="4" fill="#e74c3c" />
              <circle cx="190" cy="60" r="4" fill="#e74c3c" />
              <circle cx="230" cy="25" r="4" fill="#e74c3c" />
              <circle cx="280" cy="35" r="4" fill="#e74c3c" />

              {/* Labels */}
              <text x="30" y="115" fontSize="8" textAnchor="middle" fill="var(--water-text-muted)">Jan</text>
              <text x="70" y="115" fontSize="8" textAnchor="middle" fill="var(--water-text-muted)">Mar</text>
              <text x="110" y="115" fontSize="8" textAnchor="middle" fill="var(--water-text-muted)">May</text>
              <text x="150" y="115" fontSize="8" textAnchor="middle" fill="var(--water-text-muted)">Jul</text>
              <text x="190" y="115" fontSize="8" textAnchor="middle" fill="var(--water-text-muted)">Sep</text>
              <text x="230" y="115" fontSize="8" textAnchor="middle" fill="var(--water-text-muted)">Nov</text>
              <text x="280" y="115" fontSize="8" textAnchor="middle" fill="var(--water-text-muted)">Dec</text>
            </svg>
          </div>
        </div>

        {/* Emergency types statistics */}
        <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '230px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
            Incident Breakdown by Emergency Type
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
              <span style={{ width: '100px', color: 'var(--water-text-muted)', fontWeight: '700' }}>Pipeline burst</span>
              <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--water-bg-light)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '55%', height: '100%', backgroundColor: '#e74c3c' }} />
              </div>
              <span style={{ fontWeight: '800' }}>55%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
              <span style={{ width: '100px', color: 'var(--water-text-muted)', fontWeight: '700' }}>Contamination</span>
              <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--water-bg-light)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '25%', height: '100%', backgroundColor: '#9b59b6' }} />
              </div>
              <span style={{ fontWeight: '800' }}>25%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
              <span style={{ width: '100px', color: 'var(--water-text-muted)', fontWeight: '700' }}>Power / Pumps failure</span>
              <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--water-bg-light)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '20%', height: '100%', backgroundColor: '#f1c40f' }} />
              </div>
              <span style={{ fontWeight: '800' }}>20%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Filter and Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <EmergencySearch value={search} onSearch={(val) => { setSearch(val); setPage(1); }} />
        <EmergencyFilter filters={filters} onChange={handleFilterChange} onClear={handleClearFilters} />
      </div>

      {/* Table listing */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '2.5rem', color: 'var(--water-primary-light)' }}>
            autorenew
          </span>
        </div>
      ) : (
        <>
          <EmergencyTable 
            emergencies={emergencies}
            onView={(id) => navigate(`/water/emergency/${id}`)}
            onEdit={(id) => navigate(`/water/emergency/${id}/edit`)}
            onAssignTeam={(id) => navigate(`/water/emergency/${id}`)} // links to details team section
            onNotify={(id) => navigate(`/water/emergency/${id}`)} // links to details notifications section
            onRestore={handleOpenRestore}
            onClose={handleOpenClose}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)' }}>
                Showing page {page} of {totalPages} ({totalItems} items)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  className="water-btn"
                  style={{ opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                >
                  Previous
                </button>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  className="water-btn"
                  style={{ opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Status changes modal remarks prompt */}
      <RestoreSupplyDialog 
        isOpen={isRestoreOpen}
        onClose={() => setIsRestoreOpen(false)}
        onSubmit={handleStatusUpdateConfirm}
        title={restoreTitle}
      />

    </div>
  );
}
