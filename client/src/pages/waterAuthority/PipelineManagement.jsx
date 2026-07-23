import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import PipelineCard from '../../components/waterAuthority/PipelineCard';
import PipelineTable from '../../components/waterAuthority/PipelineTable';
import PipelineFilter from '../../components/waterAuthority/PipelineFilter';
import PipelineSearch from '../../components/waterAuthority/PipelineSearch';

import { getPipelines, deletePipeline } from '../../services/pipelineService';

export default function PipelineManagement() {
  const navigate = useNavigate();

  // Data states
  const [pipelines, setPipelines] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Stats states
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    damaged: 0,
    maintenance: 0,
    inspectionDue: 0,
    critical: 0
  });

  // Query/Filter states
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    zone: null,
    ward: null,
    condition: null,
    pipeline_type: null,
    material: null,
    status: null
  });

  const fetchPipelines = async () => {
    setIsLoading(true);
    try {
      const response = await getPipelines({
        page,
        page_size: 10,
        search: search || undefined,
        zone: filters.zone || undefined,
        ward: filters.ward || undefined,
        condition: filters.condition || undefined,
        pipeline_type: filters.pipeline_type || undefined,
        material: filters.material || undefined,
        status: filters.status || undefined
      });

      setPipelines(response.data.items);
      setTotalItems(response.data.total_items);
      setTotalPages(response.data.total_pages);
    } catch (err) {
      toast.error("Failed to load pipelines.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all pipelines to compute metrics
  const fetchStats = async () => {
    try {
      const response = await getPipelines({ page: 1, page_size: 1000 });
      const items = response.data.items;

      const newStats = {
        total: items.length,
        active: items.filter(p => p.current_status === 'ACTIVE').length,
        damaged: items.filter(p => p.current_status === 'DAMAGED').length,
        maintenance: items.filter(p => p.current_status === 'UNDER_MAINTENANCE').length,
        inspectionDue: items.filter(p => {
          if (!p.next_inspection) return false;
          return new Date(p.next_inspection) <= new Date();
        }).length,
        critical: items.filter(p => p.condition === 'CRITICAL').length
      };
      setStats(newStats);
    } catch (err) {
      console.error("Could not calculate stats:", err);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, [page, search, filters]);

  useEffect(() => {
    fetchStats();
  }, [pipelines]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      zone: null,
      ward: null,
      condition: null,
      pipeline_type: null,
      material: null,
      status: null
    });
    setSearch('');
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this pipeline? This will remove all of its inspection and maintenance logs.")) {
      try {
        await deletePipeline(id);
        toast.success("Pipeline deleted successfully.");
        fetchPipelines();
      } catch (err) {
        toast.error("Failed to delete pipeline.");
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--water-text)' }}>
            Pipeline Network Management
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--water-text-muted)', marginTop: '0.2rem' }}>
            Monitor pipelines, schedule inspections, record leaks, and manage repairs.
          </p>
        </div>
        <button 
          onClick={() => navigate('/water/pipelines/new')}
          className="water-btn"
          style={{ backgroundColor: 'var(--water-primary)', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}
        >
          <span className="material-symbols-outlined">add_circle</span>
          Register Pipeline
        </button>
      </div>

      {/* Metrics Dashboard */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem'
      }}>
        <PipelineCard title="Total Pipelines" value={stats.total} icon="schema" color="var(--water-primary-light)" />
        <PipelineCard title="Active Pipelines" value={stats.active} icon="check_circle" color="var(--water-success)" />
        <PipelineCard title="Damaged Pipelines" value={stats.damaged} icon="warning" color="var(--water-danger)" />
        <PipelineCard title="Maintenance Ongoing" value={stats.maintenance} icon="engineering" color="var(--water-warning)" />
        <PipelineCard title="Inspection Due" value={stats.inspectionDue} icon="event_busy" color="var(--water-text-muted)" />
        <PipelineCard title="Critical Pipelines" value={stats.critical} icon="dangerous" color="#d35400" />
      </div>

      {/* Search & Filter Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <PipelineSearch value={search} onSearch={(val) => { setSearch(val); setPage(1); }} />
        <PipelineFilter filters={filters} onChange={handleFilterChange} onClear={handleClearFilters} />
      </div>

      {/* Table Section */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '2.5rem', color: 'var(--water-primary-light)' }}>
            autorenew
          </span>
        </div>
      ) : (
        <>
          <PipelineTable 
            pipelines={pipelines}
            onView={(id) => navigate(`/water/pipelines/${id}`)}
            onEdit={(id) => navigate(`/water/pipelines/${id}/edit`)}
            onInspection={(id) => navigate(`/water/pipelines/${id}/inspection`)}
            onMaintenance={(id) => navigate(`/water/pipelines/${id}/maintenance`)}
            onDelete={handleDelete}
          />

          {/* Pagination Controls */}
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
