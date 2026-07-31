import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

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
    maintenance: 0
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

      setPipelines(response.data?.items || []);
      setTotalItems(response.data?.total_items || 0);
      setTotalPages(response.data?.total_pages || 1);
    } catch (err) {
      toast.error("Failed to load pipeline network.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all pipelines to compute live stats
  const fetchStats = async () => {
    try {
      const response = await getPipelines({ page: 1, page_size: 100 });
      const items = response.data?.items || [];
      const totalCount = response.data?.total_items || items.length;

      setStats({
        total: totalCount,
        active: items.filter(p => p.current_status === 'ACTIVE').length,
        damaged: items.filter(p => p.current_status === 'DAMAGED').length,
        maintenance: items.filter(p => p.current_status === 'UNDER_MAINTENANCE').length
      });
    } catch (err) {
      console.error("Could not calculate pipeline stats:", err);
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
    if (window.confirm("Are you sure you want to delete this pipeline? This will remove all associated inspection logs.")) {
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Pipeline Network Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
            Monitor municipal water pipelines, track physical condition, and manage network repairs.
          </p>
        </div>

        <button 
          onClick={() => navigate('/water/pipelines/new')}
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
          Register New Pipeline
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
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>alt_route</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Pipelines</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{stats.total}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>check_circle</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Active Network</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#16a34a' }}>{stats.active}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>engineering</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Under Maintenance</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ea580c' }}>{stats.maintenance}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>warning</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Damaged / Leaks</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#dc2626' }}>{stats.damaged}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <PipelineSearch value={search} onSearch={(val) => { setSearch(val); setPage(1); }} />
        <PipelineFilter filters={filters} onChange={handleFilterChange} onClear={handleClearFilters} />
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
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Page {page} of {totalPages} ({totalItems} pipelines registered)
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
