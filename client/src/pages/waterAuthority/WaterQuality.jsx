import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import QualityCard from '../../components/waterAuthority/QualityCard';
import QualityTable from '../../components/waterAuthority/QualityTable';
import QualityFilter from '../../components/waterAuthority/QualityFilter';
import QualitySearch from '../../components/waterAuthority/QualitySearch';
import WaterQualityChart from '../../components/waterAuthority/WaterQualityChart';

import { getQualityReports, deleteQualityReport, getQualityDashboard } from '../../services/waterQualityService';

export default function WaterQuality() {
  const navigate = useNavigate();

  // Data states
  const [reports, setReports] = useState([]);
  const [allReportsForCharts, setAllReportsForCharts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Stats
  const [dashboardStats, setDashboardStats] = useState({
    total_reports: 0,
    safe_reports: 0,
    warning_reports: 0,
    unsafe_reports: 0,
    today_tests: 0,
    pending_inspections: 0,
    critical_alerts: 0
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

      setReports(response.data.items);
      setTotalItems(response.data.total_items);
      setTotalPages(response.data.total_pages);
    } catch (err) {
      toast.error("Failed to load water quality reports.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await getQualityDashboard();
      setDashboardStats(response.data);
    } catch (err) {
      console.error("Could not fetch quality dashboard stats:", err);
    }
  };

  const fetchAllReports = async () => {
    try {
      const response = await getQualityReports({ page: 1, page_size: 1000 });
      setAllReportsForCharts(response.data.items);
    } catch (err) {
      console.error("Could not load reports for charts:", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, search, filters]);

  useEffect(() => {
    fetchDashboardStats();
    fetchAllReports();
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
    if (window.confirm("Are you sure you want to delete this water quality report? This will permanently remove its record and related alarm logs.")) {
      try {
        await deleteQualityReport(id);
        toast.success("Quality report deleted successfully.");
        fetchReports();
      } catch (err) {
        toast.error("Failed to delete report.");
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--water-text)' }}>
            Water Quality Monitoring
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--water-text-muted)', marginTop: '0.2rem' }}>
            Register quality test logs, monitor pH/TDS levels across zones, schedule inspections, and resolve contaminant alarms.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => navigate('/water/quality/inspection')}
            className="water-btn"
            style={{ borderColor: 'var(--water-border)', color: 'var(--water-text)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '700' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>event_available</span>
            Inspection Schedules
          </button>
          <button 
            onClick={() => navigate('/water/quality/alerts')}
            className="water-btn"
            style={{ 
              backgroundColor: dashboardStats.critical_alerts > 0 ? 'rgba(231, 76, 60, 0.15)' : '#ffffff', 
              borderColor: dashboardStats.critical_alerts > 0 ? '#c0392b' : 'var(--water-border)',
              color: dashboardStats.critical_alerts > 0 ? '#c0392b' : 'var(--water-text)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem',
              fontWeight: '700'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', animation: dashboardStats.critical_alerts > 0 ? 'pulse 1.5s infinite' : 'none' }}>alarm</span>
            Alarms ({dashboardStats.critical_alerts})
          </button>
          <button 
            onClick={() => navigate('/water/quality/new')}
            className="water-btn"
            style={{ backgroundColor: 'var(--water-primary)', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}
          >
            <span className="material-symbols-outlined">add_circle</span>
            Register Report
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem'
      }}>
        <QualityCard title="Total Reports" value={dashboardStats.total_reports} icon="assignment" color="var(--water-primary-light)" />
        <QualityCard title="Safe Samples" value={dashboardStats.safe_reports} icon="check_circle" color="var(--water-success)" />
        <QualityCard title="Warnings flagged" value={dashboardStats.warning_reports} icon="warning" color="var(--water-warning)" />
        <QualityCard title="Unsafe Samples" value={dashboardStats.unsafe_reports} icon="dangerous" color="#e74c3c" />
        <QualityCard title="Tests Completed Today" value={dashboardStats.today_tests} icon="science" color="#16a085" />
        <QualityCard title="Pending Inspections" value={dashboardStats.pending_inspections} icon="calendar_today" color="#8e44ad" />
      </div>

      {/* Pure SVG comparisons */}
      <WaterQualityChart reports={allReportsForCharts} />

      {/* Filter and Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <QualitySearch value={search} onSearch={(val) => { setSearch(val); setPage(1); }} />
        <QualityFilter filters={filters} onChange={handleFilterChange} onClear={handleClearFilters} />
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
          <QualityTable 
            reports={reports}
            onView={(id) => navigate(`/water/quality/${id}`)}
            onEdit={(id) => navigate(`/water/quality/${id}/edit`)}
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
