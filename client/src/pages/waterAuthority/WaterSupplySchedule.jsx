import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import ScheduleTable from '../../components/waterAuthority/ScheduleTable';
import ScheduleFilter from '../../components/waterAuthority/ScheduleFilter';
import ScheduleSearch from '../../components/waterAuthority/ScheduleSearch';
import PauseScheduleDialog from '../../components/waterAuthority/PauseScheduleDialog';
import ResumeScheduleDialog from '../../components/waterAuthority/ResumeScheduleDialog';

import {
  getSupplySchedules,
  pauseSupplySchedule,
  resumeSupplySchedule,
  deleteSupplySchedule
} from '../../services/waterSupplyService';

export default function WaterSupplySchedule() {
  const navigate = useNavigate();

  // Data states
  const [schedules, setSchedules] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    scheduled: 0,
    paused: 0
  });

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    supply_type: '',
    ward: '',
    zone: '',
    supply_date: ''
  });

  // Modal Control
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isPauseOpen, setIsPauseOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  const fetchSchedulesData = async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        page_size: 10
      };
      if (searchQuery) params.search = searchQuery;
      if (filters.status) params.status = filters.status;
      if (filters.supply_type) params.supply_type = filters.supply_type;
      if (filters.ward) params.ward = filters.ward;
      if (filters.zone) params.zone = filters.zone;
      if (filters.supply_date) params.supply_date = filters.supply_date;

      const response = await getSupplySchedules(params);
      setSchedules(response.data?.items || []);
      setTotalItems(response.data?.total_items || 0);
      setTotalPages(response.data?.total_pages || 1);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not retrieve supply schedules.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getSupplySchedules({ page: 1, page_size: 100 });
      const items = response.data?.items || [];
      const totalCount = response.data?.total_items || items.length;

      setStats({
        total: totalCount,
        active: items.filter(s => s.status === 'ACTIVE').length,
        scheduled: items.filter(s => s.status === 'SCHEDULED').length,
        paused: items.filter(s => s.status === 'PAUSED').length
      });
    } catch (err) {
      console.error("Error computing supply stats:", err);
    }
  };

  useEffect(() => {
    fetchSchedulesData();
  }, [page, filters, searchQuery]);

  useEffect(() => {
    fetchStats();
  }, [schedules]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      status: '',
      supply_type: '',
      ward: '',
      zone: '',
      supply_date: ''
    });
    setSearchQuery('');
    setPage(1);
  };

  const handlePauseClick = (schedule) => {
    setSelectedSchedule(schedule);
    setIsPauseOpen(true);
  };

  const handleResumeClick = (schedule) => {
    setSelectedSchedule(schedule);
    setIsResumeOpen(true);
  };

  const handleConfirmPause = async (remarks) => {
    if (!selectedSchedule) return;
    try {
      await pauseSupplySchedule(selectedSchedule.id, remarks);
      toast.success(`Schedule ${selectedSchedule.schedule_number} paused.`);
      setIsPauseOpen(false);
      fetchSchedulesData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to pause schedule.");
    }
  };

  const handleConfirmResume = async (remarks) => {
    if (!selectedSchedule) return;
    try {
      await resumeSupplySchedule(selectedSchedule.id, remarks);
      toast.success(`Schedule ${selectedSchedule.schedule_number} resumed.`);
      setIsResumeOpen(false);
      fetchSchedulesData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to resume schedule.");
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this supply schedule?")) {
      try {
        await deleteSupplySchedule(id);
        toast.success("Supply schedule deleted.");
        fetchSchedulesData();
      } catch (err) {
        toast.error("Failed to delete supply schedule.");
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Water Supply Schedule Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
            Manage municipal water distribution timetables, morning/evening supply slots, and ward interruptions.
          </p>
        </div>

        <button 
          onClick={() => navigate('/water/supply/new')}
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
          Schedule Water Supply
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
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>water_drop</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Schedules</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{stats.total}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>waves</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Currently Active</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#16a34a' }}>{stats.active}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>schedule</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Scheduled Slots</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ea580c' }}>{stats.scheduled}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>pause_circle</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Paused / Interrupted</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#dc2626' }}>{stats.paused}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <ScheduleSearch value={searchQuery} onSearch={(val) => { setSearchQuery(val); setPage(1); }} />
        <ScheduleFilter filters={filters} onChange={handleFilterChange} onReset={handleResetFilters} />
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
          <ScheduleTable 
            schedules={schedules}
            onView={(id) => navigate(`/water/supply/${id}`)}
            onEdit={(id) => navigate(`/water/supply/${id}/edit`)}
            onPause={handlePauseClick}
            onResume={handleResumeClick}
            onDelete={handleDeleteClick}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Page {page} of {totalPages} ({totalItems} supply schedules)
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

      {/* Modals */}
      {isPauseOpen && (
        <PauseScheduleDialog 
          schedule={selectedSchedule}
          onClose={() => setIsPauseOpen(false)}
          onConfirm={handleConfirmPause}
        />
      )}

      {isResumeOpen && (
        <ResumeScheduleDialog 
          schedule={selectedSchedule}
          onClose={() => setIsResumeOpen(false)}
          onConfirm={handleConfirmResume}
        />
      )}
    </div>
  );
}
