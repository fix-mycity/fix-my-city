import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import MaintenanceTable from '../../components/waterAuthority/MaintenanceTable';
import MaintenanceFilter from '../../components/waterAuthority/MaintenanceFilter';
import MaintenanceSearch from '../../components/waterAuthority/MaintenanceSearch';

import { getMaintenances, deleteMaintenance, getMaintenanceDashboard } from '../../services/maintenanceService';

export default function MaintenanceManagement() {
  const navigate = useNavigate();

  // Data states
  const [maintenances, setMaintenances] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Stats
  const [dashboardStats, setDashboardStats] = useState({
    total_maintenance: 0,
    pending: 0,
    in_progress: 0,
    completed: 0
  });

  // Search & Filters
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    priority: null,
    status: null,
    maintenance_type: null,
    ward: null,
    zone: null,
    source_type: null
  });

  const fetchMaintenances = async () => {
    setIsLoading(true);
    try {
      const params = { page, page_size: 10 };
      if (search && search.trim()) params.search = search.trim();
      if (filters.priority && filters.priority.trim()) params.priority = filters.priority.trim();
      if (filters.status && filters.status.trim()) params.status = filters.status.trim();
      if (filters.maintenance_type && filters.maintenance_type.trim()) params.maintenance_type = filters.maintenance_type.trim();
      if (filters.ward && filters.ward.trim()) params.ward = filters.ward.trim();
      if (filters.zone && filters.zone.trim()) params.zone = filters.zone.trim();
      if (filters.source_type && filters.source_type.trim()) params.source_type = filters.source_type.trim();

      const response = await getMaintenances(params);
      const items = Array.isArray(response.data?.items) 
        ? response.data.items 
        : (Array.isArray(response.data) ? response.data : []);

      setMaintenances(items);
      setTotalItems(response.data?.total_items ?? items.length);
      setTotalPages(response.data?.total_pages ?? Math.ceil(items.length / 10));
    } catch (err) {
      toast.error("Failed to load maintenance records.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await getMaintenanceDashboard();
      if (response.data) {
        setDashboardStats({
          total_maintenance: response.data.total_maintenance || 0,
          pending: response.data.pending || 0,
          in_progress: response.data.in_progress || 0,
          completed: response.data.completed || 0
        });
      }
    } catch (err) {
      console.error("Could not fetch maintenance dashboard stats:", err);
    }
  };

  const fetchAllMaintenancesStats = async () => {
    try {
      const response = await getMaintenances({ page: 1, page_size: 100 });
      const items = response.data?.items || [];
      const totalCount = response.data?.total_items || items.length;

      if (items.length > 0) {
        setDashboardStats(prev => ({
          total_maintenance: totalCount,
          pending: items.filter(m => m.status === 'PENDING' || m.status === 'SCHEDULED').length,
          in_progress: items.filter(m => m.status === 'IN_PROGRESS').length,
          completed: items.filter(m => m.status === 'COMPLETED' || m.status === 'VERIFIED').length
        }));
      }
    } catch (err) {
      console.error("Could not compute fallback maintenance stats:", err);
    }
  };

  useEffect(() => {
    fetchMaintenances();
  }, [page, search, filters]);

  useEffect(() => {
    fetchDashboardStats();
    fetchAllMaintenancesStats();
  }, [maintenances]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      priority: null,
      status: null,
      maintenance_type: null,
      ward: null,
      zone: null,
      source_type: null
    });
    setSearch('');
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this maintenance request?")) {
      try {
        await deleteMaintenance(id);
        toast.success("Maintenance request deleted successfully.");
        fetchMaintenances();
      } catch (err) {
        toast.error("Failed to delete maintenance request.");
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Maintenance & Repairs Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
            Schedule pipeline repairs, dispatch field maintenance crews, track valve replacements, and monitor repair jobs.
          </p>
        </div>

        <button 
          onClick={() => navigate('/water/maintenance/new')}
          style={{
            backgroundColor: '#2563eb',
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
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
          Log Maintenance Request
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
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>build</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Repair Jobs</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{dashboardStats.total_maintenance}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>hourglass_top</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Pending / Scheduled</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ea580c' }}>{dashboardStats.pending}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fefce8', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>engineering</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>In Progress Repairs</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ca8a04' }}>{dashboardStats.in_progress}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>check_circle</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Completed & Verified</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#16a34a' }}>{dashboardStats.completed}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <MaintenanceSearch value={search} onSearch={(val) => { setSearch(val); setPage(1); }} />
        <MaintenanceFilter filters={filters} onChange={handleFilterChange} onClear={handleClearFilters} />
      </div>

      {/* Table Section */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '2.5rem', color: '#2563eb' }}>
            autorenew
          </span>
        </div>
      ) : (
        <>
          <MaintenanceTable 
            maintenances={maintenances}
            onView={(id) => navigate(`/water/maintenance/${id}`)}
            onEdit={(id) => navigate(`/water/maintenance/${id}/edit`)}
            onDelete={handleDelete}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Page {page} of {totalPages} ({totalItems} maintenance jobs registered)
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
    </div>
  );
}
