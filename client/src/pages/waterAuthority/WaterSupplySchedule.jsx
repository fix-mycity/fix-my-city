import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import PageHeader from '../../components/waterAuthority/PageHeader';
import ScheduleTable from '../../components/waterAuthority/ScheduleTable';
import ScheduleFilter from '../../components/waterAuthority/ScheduleFilter';
import ScheduleSearch from '../../components/waterAuthority/ScheduleSearch';
import EmptyState from '../../components/waterAuthority/EmptyState';
import PauseScheduleDialog from '../../components/waterAuthority/PauseScheduleDialog';
import ResumeScheduleDialog from '../../components/waterAuthority/ResumeScheduleDialog';

import TodaysSupplyCard from "../../components/waterAuthority/Today'sSupplyCard";
import UpcomingSupplyCard from '../../components/waterAuthority/UpcomingSupplyCard';

import {
  getSupplySchedules,
  getTodaySupplySchedules,
  getUpcomingSupplySchedules,
  pauseSupplySchedule,
  resumeSupplySchedule,
  deleteSupplySchedule
} from '../../services/waterSupplyService';

export default function WaterSupplySchedule() {
  const navigate = useNavigate();

  // State
  const [schedules, setSchedules] = useState([]);
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

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

  // Fetch summaries and stats
  const fetchSummaries = async () => {
    try {
      const todayRes = await getTodaySupplySchedules();
      setTodaySchedules(todayRes.data || []);
      const upcomingRes = await getUpcomingSupplySchedules();
      setUpcomingSchedules(upcomingRes.data || []);
    } catch (err) {
      console.error("Error loading supply summaries", err);
    }
  };

  // Fetch list data
  const fetchSchedulesData = async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize
      };
      if (searchQuery) params.search = searchQuery;
      if (filters.status) params.status = filters.status;
      if (filters.supply_type) params.supply_type = filters.supply_type;
      if (filters.ward) params.ward = filters.ward;
      if (filters.zone) params.zone = filters.zone;
      if (filters.supply_date) params.supply_date = filters.supply_date;

      const response = await getSupplySchedules(params);
      setSchedules(response.data.items || []);
      setTotalItems(response.data.total_items || 0);
      setTotalPages(response.data.total_pages || 1);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not retrieve supply schedules.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  useEffect(() => {
    fetchSchedulesData();
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
      status: '',
      supply_type: '',
      ward: '',
      zone: '',
      supply_date: ''
    });
    setSearchQuery('');
    setPage(1);
  };

  // Actions
  const handleView = (id) => {
    navigate(`/water/supply/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/water/supply/${id}/edit`);
  };

  const handleOpenPause = (schedule) => {
    setSelectedSchedule(schedule);
    setIsPauseOpen(true);
  };

  const handleOpenResume = (schedule) => {
    setSelectedSchedule(schedule);
    setIsResumeOpen(true);
  };

  const handlePauseConfirm = async (id, remarks) => {
    try {
      await pauseSupplySchedule(id, remarks);
      toast.success("Water supply paused successfully!");
      fetchSummaries();
      fetchSchedulesData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to pause schedule.");
    }
  };

  const handleResumeConfirm = async (id, remarks) => {
    try {
      await resumeSupplySchedule(id, remarks);
      toast.success("Water supply resumed successfully!");
      fetchSummaries();
      fetchSchedulesData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to resume schedule.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this schedule permanently?")) {
      try {
        await deleteSupplySchedule(id);
        toast.success("Schedule deleted successfully!");
        fetchSummaries();
        fetchSchedulesData();
      } catch (err) {
        toast.error(err.response?.data?.detail || "Failed to delete schedule.");
      }
    }
  };

  // Dashboard calculations
  const activeSchedulesCount = schedules.filter(s => s.status === 'ACTIVE').length;
  const pausedSchedulesCount = schedules.filter(s => s.status === 'PAUSED').length;
  const completedTodayCount = todaySchedules.filter(s => s.status === 'COMPLETED').length;
  const emergencySupplyCount = schedules.filter(s => s.supply_type === 'EMERGENCY').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader 
        title="Water Supply Schedule Management"
        subtitle="Manage water distribution timetables, emergency interruptions, and supply zones."
        action={
          <button 
            onClick={() => navigate('/water/supply/new')}
            className="water-btn water-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}
          >
            <span className="material-symbols-outlined">add_circle</span>
            Add Supply Schedule
          </button>
        }
      />

      {/* Stats Cards Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Today's Supply summary card */}
        <TodaysSupplyCard todaySchedules={todaySchedules} />

        {/* Upcoming Supply summary card */}
        <UpcomingSupplyCard upcomingSchedules={upcomingSchedules} />

        {/* Mini stats cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem'
        }}>
          {/* Active Schedules */}
          <div className="water-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--water-text-muted)', fontWeight: '700' }}>ACTIVE SCHEDULES</span>
            <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--water-success)', margin: '0.2rem 0' }}>{activeSchedulesCount}</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--water-text-muted)' }}>Distribution in progress</span>
          </div>

          {/* Paused Schedules */}
          <div className="water-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--water-text-muted)', fontWeight: '700' }}>PAUSED SCHEDULES</span>
            <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--water-warning)', margin: '0.2rem 0' }}>{pausedSchedulesCount}</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--water-text-muted)' }}>Temporarily interrupted</span>
          </div>

          {/* Completed Today */}
          <div className="water-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--water-text-muted)', fontWeight: '700' }}>COMPLETED TODAY</span>
            <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--water-primary-light)', margin: '0.2rem 0' }}>{completedTodayCount}</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--water-text-muted)' }}>Schedules closed today</span>
          </div>

          {/* Emergency Supply */}
          <div className="water-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--water-text-muted)', fontWeight: '700' }}>EMERGENCY SUPPLY</span>
            <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--water-danger)', margin: '0.2rem 0' }}>{emergencySupplyCount}</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--water-text-muted)' }}>Emergency deployments</span>
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <ScheduleSearch onSearch={handleSearch} />
        </div>
        <ScheduleFilter 
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* Table Section */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '2.5rem', color: 'var(--water-primary)' }}>autorenew</span>
        </div>
      ) : schedules.length === 0 ? (
        <EmptyState 
          title="No Supply Schedules Found"
          description="Create a new water supply schedule to initiate municipal water distribution for a zone."
          icon="water_drop"
        />
      ) : (
        <>
          <ScheduleTable 
            schedules={schedules}
            onView={handleView}
            onEdit={handleEdit}
            onPause={handleOpenPause}
            onResume={handleOpenResume}
            onDelete={handleDelete}
          />
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--water-text-muted)' }}>
                Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalItems} schedules)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="water-btn"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  Previous
                </button>
                <button 
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="water-btn"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Dialogs */}
      <PauseScheduleDialog 
        isOpen={isPauseOpen}
        onClose={() => setIsPauseOpen(false)}
        onConfirm={handlePauseConfirm}
        schedule={selectedSchedule}
      />
      <ResumeScheduleDialog 
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
        onConfirm={handleResumeConfirm}
        schedule={selectedSchedule}
      />
    </div>
  );
}
