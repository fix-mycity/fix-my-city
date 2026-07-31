import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import QualityTable from '../../components/waterAuthority/QualityTable';
import QualityFilter from '../../components/waterAuthority/QualityFilter';
import QualitySearch from '../../components/waterAuthority/QualitySearch';

import { getQualityReports, deleteQualityReport, getQualityDashboard } from '../../services/waterQualityService';

export default function WaterQuality() {
  const navigate = useNavigate();

  // Data states
  const [reports, setReports] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Stats
  const [dashboardStats, setDashboardStats] = useState({
    total_reports: 0,
    safe_reports: 0,
    warning_reports: 0,
    unsafe_reports: 0
  });

  // Search & Filters
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    overall_status: null,
    zone: null,
    ward: null,
    sample_type: null,
    sample_date: null
  });

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await getQualityReports({
        page,
        page_size: 10,
        search: search || undefined,
        overall_status: filters.overall_status || undefined,
        zone: filters.zone || undefined,
        ward: filters.ward || undefined,
        sample_type: filters.sample_type || undefined,
        sample_date: filters.sample_date || undefined
      });

      setReports(response.data?.items || []);
      setTotalItems(response.data?.total_items || 0);
      setTotalPages(response.data?.total_pages || 1);
    } catch (err) {
      toast.error("Failed to load water quality lab reports.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await getQualityDashboard();
      if (response.data) {
        setDashboardStats(response.data);
      }
    } catch (err) {
      console.error("Could not fetch quality dashboard stats:", err);
    }
  };

  const fetchAllReportsStats = async () => {
    try {
      const response = await getQualityReports({ page: 1, page_size: 100 });
      const items = response.data?.items || [];
      const totalCount = response.data?.total_items || items.length;

      if (items.length > 0) {
        setDashboardStats(prev => ({
          total_reports: totalCount,
          safe_reports: items.filter(r => r.overall_status === 'SAFE').length,
          warning_reports: items.filter(r => r.overall_status === 'WARNING').length,
          unsafe_reports: items.filter(r => r.overall_status === 'UNSAFE').length
        }));
      }
    } catch (err) {
      console.error("Could not compute fallback quality stats:", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, search, filters]);

  useEffect(() => {
    fetchDashboardStats();
    fetchAllReportsStats();
  }, [reports]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      overall_status: null,
      zone: null,
      ward: null,
      sample_type: null,
      sample_date: null
    });
    setSearch('');
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this water quality test report?")) {
      try {
        await deleteQualityReport(id);
        toast.success("Quality report deleted successfully.");
        fetchReports();
      } catch (err) {
        toast.error("Failed to delete quality report.");
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Water Quality Laboratory Monitoring
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
            Register lab test reports, monitor pH/TDS levels across municipal wards, and detect water contaminants.
          </p>
        </div>

        <button 
          onClick={() => navigate('/water/quality/new')}
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
          Register Lab Report
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
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>science</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Test Reports</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{dashboardStats.total_reports}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>check_circle</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Safe Drinking Water</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#16a34a' }}>{dashboardStats.safe_reports}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>warning</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Warnings Flagged</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ea580c' }}>{dashboardStats.warning_reports}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>dangerous</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Unsafe Contaminated</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#dc2626' }}>{dashboardStats.unsafe_reports}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <QualitySearch value={search} onSearch={(val) => { setSearch(val); setPage(1); }} />
        <QualityFilter filters={filters} onChange={handleFilterChange} onClear={handleClearFilters} />
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
          <QualityTable 
            reports={reports}
            onView={(id) => navigate(`/water/quality/${id}`)}
            onEdit={(id) => navigate(`/water/quality/${id}/edit`)}
            onDelete={handleDelete}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Page {page} of {totalPages} ({totalItems} quality test reports)
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
