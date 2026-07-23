import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import MaintenanceCard from '../../components/waterAuthority/MaintenanceCard';
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
    scheduled: 0,
    in_progress: 0,
    completed: 0,
    overdue: 0,
    estimated_cost: 0,
    actual_cost: 0
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
      const response = await getMaintenances({
        page,
        page_size: 10,
        search: search || undefined,
        priority: filters.priority || undefined,
        status: filters.status || undefined,
        maintenance_type: filters.maintenance_type || undefined,
        ward: filters.ward || undefined,
        zone: filters.zone || undefined,
        source_type: filters.source_type || undefined
      });

      setMaintenances(response.data.items);
      setTotalItems(response.data.total_items);
      setTotalPages(response.data.total_pages);
    } catch (err) {
      toast.error("Failed to load maintenance records.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await getMaintenanceDashboard();
      setDashboardStats(response.data);
    } catch (err) {
      console.error("Could not fetch dashboard statistics:", err);
    }
  };

  useEffect(() => {
    fetchMaintenances();
  }, [page, search, filters]);

  useEffect(() => {
    fetchDashboardStats();
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
    if (window.confirm("Are you sure you want to delete this maintenance record? All associated task breakdowns, material usage records, and logs will be permanently deleted.")) {
      try {
        await deleteMaintenance(id);
        toast.success("Maintenance record deleted successfully.");
        fetchMaintenances();
      } catch (err) {
        toast.error("Failed to delete record.");
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--water-text)' }}>
            Maintenance & Repairs Management
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--water-text-muted)', marginTop: '0.2rem' }}>
            Schedule and dispatch pipeline repairs, tank cleaning tasks, valve replacements, and track expenses.
          </p>
        </div>

        <button 
          onClick={() => navigate('/water/maintenance/new')}
          className="water-btn"
          style={{ backgroundColor: 'var(--water-primary)', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}
        >
          <span className="material-symbols-outlined">add_circle</span>
          Create Maintenance Request
        </button>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem'
      }}>
        <MaintenanceCard title="Total Jobs" value={dashboardStats.total_maintenance} icon="engineering" color="var(--water-primary-light)" />
        <MaintenanceCard title="Pending" value={dashboardStats.pending} icon="pending_actions" color="#95a5a6" />
        <MaintenanceCard title="Scheduled" value={dashboardStats.scheduled} icon="calendar_today" color="var(--water-primary)" />
        <MaintenanceCard title="In Progress" value={dashboardStats.in_progress} icon="autorenew" color="var(--water-warning)" />
        <MaintenanceCard title="Completed" value={dashboardStats.completed} icon="verified" color="var(--water-success)" />
        <MaintenanceCard title="Overdue Alert" value={dashboardStats.overdue} icon="error" color="#e74c3c" />
        <MaintenanceCard title="Est. Cost" value={`$${dashboardStats.estimated_cost?.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon="payments" color="#9b59b6" />
        <MaintenanceCard title="Actual Spent" value={`$${dashboardStats.actual_cost?.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon="monetization_on" color="#16a085" />
      </div>

      {/* Visual SVG charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Cost Analysis Chart */}
        <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '220px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
            Budget vs Actual Expense Breakdown
          </h3>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            {/* Draw a clean comparative bar graph in pure SVG */}
            <svg width="240" height="150" viewBox="0 0 240 150">
              {/* Y Axis line */}
              <line x1="40" y1="10" x2="40" y2="120" stroke="var(--water-border)" strokeWidth="2" />
              {/* X Axis line */}
              <line x1="40" y1="120" x2="220" y2="120" stroke="var(--water-border)" strokeWidth="2" />

              {/* Estimate Bar */}
              <rect 
                x="70" 
                y={120 - Math.min((dashboardStats.estimated_cost / Math.max(dashboardStats.estimated_cost, dashboardStats.actual_cost, 1)) * 100, 100)} 
                width="35" 
                height={Math.min((dashboardStats.estimated_cost / Math.max(dashboardStats.estimated_cost, dashboardStats.actual_cost, 1)) * 100, 100)} 
                fill="#9b59b6" 
                rx="4"
              />
              <text x="87" y="135" fontSize="10" textAnchor="middle" fill="var(--water-text-muted)" fontWeight="bold">Est</text>
              <text 
                x="87" 
                y={110 - Math.min((dashboardStats.estimated_cost / Math.max(dashboardStats.estimated_cost, dashboardStats.actual_cost, 1)) * 100, 100)} 
                fontSize="10" 
                textAnchor="middle" 
                fill="var(--water-text)" 
                fontWeight="bold"
              >
                ${dashboardStats.estimated_cost > 1000 ? `${(dashboardStats.estimated_cost / 1000).toFixed(1)}k` : dashboardStats.estimated_cost}
              </text>

              {/* Actual Spent Bar */}
              <rect 
                x="140" 
                y={120 - Math.min((dashboardStats.actual_cost / Math.max(dashboardStats.estimated_cost, dashboardStats.actual_cost, 1)) * 100, 100)} 
                width="35" 
                height={Math.min((dashboardStats.actual_cost / Math.max(dashboardStats.estimated_cost, dashboardStats.actual_cost, 1)) * 100, 100)} 
                fill="#16a085" 
                rx="4"
              />
              <text x="157" y="135" fontSize="10" textAnchor="middle" fill="var(--water-text-muted)" fontWeight="bold">Act</text>
              <text 
                x="157" 
                y={110 - Math.min((dashboardStats.actual_cost / Math.max(dashboardStats.estimated_cost, dashboardStats.actual_cost, 1)) * 100, 100)} 
                fontSize="10" 
                textAnchor="middle" 
                fill="var(--water-text)" 
                fontWeight="bold"
              >
                ${dashboardStats.actual_cost > 1000 ? `${(dashboardStats.actual_cost / 1000).toFixed(1)}k` : dashboardStats.actual_cost}
              </text>
            </svg>
          </div>
        </div>

        {/* Maintenance by Type bar */}
        <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '220px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
            Recent Maintenance Request Types
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
              <span style={{ width: '100px', color: 'var(--water-text-muted)', fontWeight: '700' }}>Pipeline repairs</span>
              <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--water-bg-light)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '65%', height: '100%', backgroundColor: 'var(--water-primary)' }} />
              </div>
              <span style={{ fontWeight: '800' }}>65%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
              <span style={{ width: '100px', color: 'var(--water-text-muted)', fontWeight: '700' }}>Tank Cleanings</span>
              <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--water-bg-light)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '20%', height: '100%', backgroundColor: 'var(--water-success)' }} />
              </div>
              <span style={{ fontWeight: '800' }}>20%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
              <span style={{ width: '100px', color: 'var(--water-text-muted)', fontWeight: '700' }}>Pump / Valves Maint</span>
              <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--water-bg-light)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '15%', height: '100%', backgroundColor: 'var(--water-warning)' }} />
              </div>
              <span style={{ fontWeight: '800' }}>15%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Filter and Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <MaintenanceSearch value={search} onSearch={(val) => { setSearch(val); setPage(1); }} />
        <MaintenanceFilter filters={filters} onChange={handleFilterChange} onClear={handleClearFilters} />
      </div>

      {/* Table grid */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '2.5rem', color: 'var(--water-primary-light)' }}>
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

    </div>
  );
}
