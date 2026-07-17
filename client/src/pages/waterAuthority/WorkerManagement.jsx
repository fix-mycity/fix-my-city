import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { toastConfirm } from '../../utils/toastConfirm';

import PageHeader from '../../components/waterAuthority/PageHeader';
import WorkerStats from '../../components/waterAuthority/WorkerStats';
import WorkerSearch from '../../components/waterAuthority/WorkerSearch';
import WorkerFilter from '../../components/waterAuthority/WorkerFilter';
import WorkerTable from '../../components/waterAuthority/WorkerTable';
import WorkerCard from '../../components/waterAuthority/WorkerCard';
import DeactivateWorkerDialog from '../../components/waterAuthority/DeactivateWorkerDialog';
import LoadingSkeleton from '../../components/waterAuthority/LoadingSkeleton';

import { 
  getWorkers, 
  deleteWorker, 
  updateWorkerStatus 
} from '../../services/workerService';

export default function WorkerManagement() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    availability: '',
    employment_status: '',
    skill: '',
    place: '',
    pin_code: ''
  });

  // Summary statistics
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    busy: 0,
    onLeave: 0,
    inactive: 0
  });

  // Modal Control
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  const fetchSummaryStats = async () => {
    try {
      // Fetch a larger batch to compute stats locally
      const response = await getWorkers({ page_size: 1000 });
      const items = response.data.items || [];
      setStats({
        total: items.length,
        available: items.filter(w => w.availability === 'AVAILABLE' && w.employment_status === 'ACTIVE').length,
        busy: items.filter(w => w.availability === 'BUSY' && w.employment_status === 'ACTIVE').length,
        onLeave: items.filter(w => w.availability === 'ON_LEAVE' && w.employment_status === 'ACTIVE').length,
        inactive: items.filter(w => w.employment_status !== 'ACTIVE').length
      });
    } catch (err) {
      console.error("Error fetching stats summaries", err);
    }
  };

  const fetchWorkersData = async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize
      };

      if (searchQuery) params.search = searchQuery;
      if (filters.availability) params.availability = filters.availability;
      if (filters.employment_status) params.employment_status = filters.employment_status;
      if (filters.skill) params.skill = filters.skill;
      if (filters.place) params.place = filters.place;
      if (filters.pin_code) params.pin_code = filters.pin_code;

      const response = await getWorkers(params);
      setWorkers(response.data.items || []);
      setTotalItems(response.data.total_items || 0);
      setTotalPages(response.data.total_pages || 1);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not retrieve field workers list.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryStats();
  }, []);

  useEffect(() => {
    fetchWorkersData();
  }, [page, filters, searchQuery]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      availability: '',
      employment_status: '',
      skill: '',
      place: '',
      pin_code: ''
    });
    setSearchQuery('');
    setPage(1);
  };

  const handleViewProfile = (id) => {
    navigate(`/water/workers/${id}`);
  };

  const handleEditWorker = (id) => {
    navigate(`/water/workers/${id}/edit`);
  };

  const handleOpenToggleModal = (worker) => {
    setSelectedWorker(worker);
    setIsDeactivateOpen(true);
  };

  const handleToggleConfirm = async (workerId, newStatus) => {
    try {
      await updateWorkerStatus(workerId, newStatus);
      toast.success(`Worker status updated to ${newStatus}.`);
      fetchWorkersData();
      fetchSummaryStats();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update worker status.");
    }
  };

  const handleDeleteWorker = async (id) => {
    toastConfirm(
      "Are you sure you want to delete this field worker from the registry? This action is permanent.",
      async () => {
        try {
          await deleteWorker(id);
          toast.success("Field worker deleted successfully.");
          fetchWorkersData();
          fetchSummaryStats();
        } catch (err) {
          toast.error(err.response?.data?.detail || "Failed to delete worker.");
        }
      }
    );
  };

  const handleCreateNew = () => {
    navigate('/water/workers/new');
  };

  return (
    <div className="water-workers-page">
      {isLoading && workers.length === 0 ? (
        <LoadingSkeleton />
      ) : (
        <>
          <PageHeader 
            title="Field Worker Registry" 
            subtitle="Water Authority Maintenance & Repairs Staff" 
            onActionClick={handleCreateNew}
            actionLabel="Register Field Worker"
            isLoading={isLoading}
          />

          {/* Quick Stats Grid */}
          <WorkerStats stats={stats} />

          {/* Control Bar: Search & View Mode Toggles */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap'
          }}>
            <WorkerSearch onSearch={handleSearch} />
            
            <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#e2e8f0', padding: '3px', borderRadius: '8px' }}>
              <button 
                onClick={() => setViewMode('table')}
                style={{
                  border: 'none',
                  backgroundColor: viewMode === 'table' ? '#ffffff' : 'transparent',
                  color: viewMode === 'table' ? 'var(--water-primary-dark)' : 'var(--water-text-muted)',
                  cursor: 'pointer',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: '700',
                  fontSize: '0.75rem',
                  gap: '0.2rem'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>table_rows</span>
                Table
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                style={{
                  border: 'none',
                  backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--water-primary-dark)' : 'var(--water-text-muted)',
                  cursor: 'pointer',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: '700',
                  fontSize: '0.75rem',
                  gap: '0.2rem'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>grid_view</span>
                Grid
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <WorkerFilter 
            filters={filters} 
            onChange={handleFilterChange} 
            onReset={handleResetFilters} 
          />

          {/* Listing */}
          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--water-primary-light)', animation: 'spin 1.5s linear infinite' }}>
                sync
              </span>
              <p style={{ marginTop: '0.5rem', color: 'var(--water-text-muted)', fontSize: '0.88rem' }}>Updating employee list...</p>
            </div>
          ) : viewMode === 'table' ? (
            <WorkerTable 
              workers={workers}
              onViewProfile={handleViewProfile}
              onEditWorker={handleEditWorker}
              onToggleStatus={handleOpenToggleModal}
              onDeleteWorker={handleDeleteWorker}
            />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              {workers.length === 0 ? (
                <div style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center', color: 'var(--water-text-muted)', fontStyle: 'italic', backgroundColor: '#ffffff', border: '1px solid var(--water-border)', borderRadius: 'var(--water-radius)' }}>
                  No field workers registered or matching criteria.
                </div>
              ) : (
                workers.map(w => (
                  <WorkerCard 
                    key={w.id}
                    worker={w}
                    onViewProfile={handleViewProfile}
                    onEditWorker={handleEditWorker}
                    onToggleStatus={handleOpenToggleModal}
                    onDeleteWorker={handleDeleteWorker}
                  />
                ))
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--water-radius)',
              border: '1px solid var(--water-border)',
              fontSize: '0.8rem',
              color: 'var(--water-text-muted)'
            }}>
              <span>
                Showing <strong>{((page - 1) * pageSize) + 1}</strong> to <strong>{Math.min(page * pageSize, totalItems)}</strong> of <strong>{totalItems}</strong> employees
              </span>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    border: '1px solid var(--water-border)',
                    borderRadius: '6px',
                    backgroundColor: page === 1 ? '#f1f5f9' : '#ffffff',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Previous
                </button>
                <span style={{ padding: '0 0.5rem' }}>Page <strong>{page}</strong> of <strong>{totalPages}</strong></span>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    border: '1px solid var(--water-border)',
                    borderRadius: '6px',
                    backgroundColor: page === totalPages ? '#f1f5f9' : '#ffffff',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Status Modal */}
          <DeactivateWorkerDialog 
            isOpen={isDeactivateOpen}
            onClose={() => setIsDeactivateOpen(false)}
            onConfirm={handleToggleConfirm}
            worker={selectedWorker}
          />
        </>
      )}
    </div>
  );
}
