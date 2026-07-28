import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import EmergencyTable from '../../components/waterAuthority/EmergencyTable';
import EmergencyFilter from '../../components/waterAuthority/EmergencyFilter';
import EmergencySearch from '../../components/waterAuthority/EmergencySearch';
import RestoreSupplyDialog from '../../components/waterAuthority/RestoreSupplyDialog';

import { getEmergencies, deleteEmergency, getEmergencyDashboard, updateEmergencyStatus } from '../../services/emergencyService';

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
    total_emergencies: 0
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

  const fetchEmergencies = async () => {
    setIsLoading(true);
    try {
      const params = { page, page_size: 10 };
      if (search && search.trim()) params.search = search.trim();
      if (filters.priority && filters.priority.trim()) params.priority = filters.priority.trim();
      if (filters.status && filters.status.trim()) params.status = filters.status.trim();
      if (filters.emergency_type && filters.emergency_type.trim()) params.emergency_type = filters.emergency_type.trim();
      if (filters.ward && filters.ward.trim()) params.ward = filters.ward.trim();
      if (filters.zone && filters.zone.trim()) params.zone = filters.zone.trim();

      const response = await getEmergencies(params);
      const items = Array.isArray(response.data?.items) 
        ? response.data.items 
        : (Array.isArray(response.data) ? response.data : []);

      setEmergencies(items);
      setTotalItems(response.data?.total_items ?? items.length);
      setTotalPages(response.data?.total_pages ?? Math.ceil(items.length / 10));
    } catch (err) {
      toast.error("Failed to load emergency shutdown records.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await getEmergencyDashboard();
      if (response.data) {
        setDashboardStats(prev => ({
          ...prev,
          active_emergencies: response.data.active_emergencies || 0,
          resolved_emergencies: response.data.resolved_emergencies || 0,
          critical_emergencies: response.data.critical_emergencies || 0
        }));
      }
    } catch (err) {
      console.error("Could not fetch emergency dashboard stats:", err);
    }
  };

  const fetchAllEmergenciesStats = async () => {
    try {
      const response = await getEmergencies({ page: 1, page_size: 100 });
      const items = response.data?.items || [];
      const totalCount = response.data?.total_items || items.length;

      if (items.length > 0) {
        setDashboardStats({
          total_emergencies: totalCount,
          active_emergencies: items.filter(e => e.status === 'DECLARED' || e.status === 'UNDER_REPAIR').length,
          critical_emergencies: items.filter(e => e.priority === 'CRITICAL' && e.status !== 'CLOSED').length,
          resolved_emergencies: items.filter(e => e.status === 'RESTORED' || e.status === 'CLOSED').length
        });
      }
    } catch (err) {
      console.error("Could not compute fallback emergency stats:", err);
    }
  };

  useEffect(() => {
    fetchEmergencies();
  }, [page, search, filters]);

  useEffect(() => {
    fetchDashboardStats();
    fetchAllEmergenciesStats();
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

  const handleOpenRestore = (id) => {
    setRestoreId(id);
    setIsRestoreOpen(true);
  };

  const handleConfirmRestore = async (remarks) => {
    if (!restoreId) return;
    try {
      await updateEmergencyStatus(restoreId, { status: "RESTORED", remarks });
      toast.success("Water supply restored successfully.");
      setIsRestoreOpen(false);
      fetchEmergencies();
    } catch (err) {
      toast.error("Failed to restore water supply.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this emergency shutdown record?")) {
      try {
        await deleteEmergency(id);
        toast.success("Emergency shutdown record deleted successfully.");
        fetchEmergencies();
      } catch (err) {
        toast.error("Failed to delete emergency record.");
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Emergency Shutdown Control Center
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
            Declare pipe bursts, major leakages, or tank contamination alerts, stop water flow, and dispatch rapid response crews.
          </p>
        </div>

        <button 
          onClick={() => navigate('/water/emergency/new')}
          style={{
            backgroundColor: '#dc2626',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.6rem 1.25rem',
            fontWeight: '700',
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>warning</span>
          Declare Emergency Shutdown
        </button>
      </div>

      {/* Clean Metrics Summary Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>dangerous</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Emergency Incidents</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{dashboardStats.total_emergencies || dashboardStats.active_emergencies + dashboardStats.resolved_emergencies}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>valve</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Active (Water Isolated)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#dc2626' }}>{dashboardStats.active_emergencies}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>priority_high</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Critical Priority</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ea580c' }}>{dashboardStats.critical_emergencies}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>check_circle</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Water Supply Restored</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#16a34a' }}>{dashboardStats.resolved_emergencies}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <EmergencySearch value={search} onSearch={(val) => { setSearch(val); setPage(1); }} />
        <EmergencyFilter filters={filters} onChange={handleFilterChange} onClear={handleClearFilters} />
      </div>

      {/* Table Section */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '2.5rem', color: '#dc2626' }}>
            autorenew
          </span>
        </div>
      ) : (
        <>
          <EmergencyTable 
            emergencies={emergencies}
            onView={(id) => navigate(`/water/emergency/${id}`)}
            onEdit={(id) => navigate(`/water/emergency/${id}/edit`)}
            onRestore={handleOpenRestore}
            onDelete={handleDelete}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Page {page} of {totalPages} ({totalItems} emergency shutdown records)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    opacity: page === 1 ? 0.5 : 1
                  }}
                >
                  Previous
                </button>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    opacity: page === totalPages ? 0.5 : 1
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Restore Dialog */}
      {isRestoreOpen && (
        <RestoreSupplyDialog 
          onClose={() => setIsRestoreOpen(false)}
          onConfirm={handleConfirmRestore}
        />
      )}
    </div>
  );
}
