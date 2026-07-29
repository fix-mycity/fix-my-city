import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/wasteManagement/PageHeader';
import { ScheduleFilter, ScheduleSearch } from '../../components/wasteManagement/ScheduleFilter';
import { ScheduleTable } from '../../components/wasteManagement/ScheduleTable';
import { ScheduleCalendarView } from '../../components/wasteManagement/ScheduleCalendarView';
import { ScheduleStatusModal } from '../../components/wasteManagement/ScheduleStatusModal';
import { AssignRouteWorkersModal } from '../../components/wasteManagement/ScheduleStatusBadge';
import AddScheduleModal from '../../components/wasteManagement/AddScheduleModal';
import LoadingSkeleton from '../../components/wasteManagement/LoadingSkeleton';

import { getWasteSchedules, getTodayWasteSchedules, deleteWasteSchedule } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export default function WasteCollectionSchedulePage() {
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'calendar', 'today'

  // Data State
  const [schedules, setSchedules] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    waste_type: '',
    ward: '',
    scheduled_date: ''
  });

  // Modals
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'today') {
        const res = await getTodayWasteSchedules();
        setSchedules(res.data || []);
        setTotalItems(res.data?.length || 0);
        setTotalPages(1);
      } else {
        const params = {
          page,
          page_size: pageSize
        };
        if (searchQuery) params.search = searchQuery;
        if (filters.status) params.status = filters.status;
        if (filters.waste_type) params.waste_type = filters.waste_type;
        if (filters.ward) params.ward = filters.ward;
        if (filters.scheduled_date) params.scheduled_date = filters.scheduled_date;

        const res = await getWasteSchedules(params);
        setSchedules(res.data.items || []);
        setTotalItems(res.data.total || 0);
        setTotalPages(res.data.total_pages || 1);
      }
    } catch (err) {
      toast.error('Failed to load collection schedules.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'calendar') {
      fetchSchedules();
    }
  }, [page, searchQuery, filters, activeTab]);

  const handleResetFilters = () => {
    setFilters({
      status: '',
      waste_type: '',
      ward: '',
      scheduled_date: ''
    });
    setSearchQuery('');
    setPage(1);
  };

  const handleOpenStatusModal = (schedule) => {
    setSelectedSchedule(schedule);
    setIsStatusOpen(true);
  };

  const handleOpenAssignModal = (schedule) => {
    setSelectedSchedule(schedule);
    setIsAssignOpen(true);
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm('Are you sure you want to delete this collection schedule?')) {
      try {
        await deleteWasteSchedule(id);
        toast.success('Collection schedule deleted successfully');
        fetchSchedules();
      } catch (err) {
        toast.error('Failed to delete schedule.');
      }
    }
  };

  // KPI Calculations
  const completedCount = schedules.filter(s => {
    const st = (s.status || '').toUpperCase();
    return st === 'COMPLETED' || st === 'FINISHED' || st === 'RESOLVED';
  }).length;

  const inProgressCount = schedules.filter(s => {
    const st = (s.status || '').toUpperCase();
    return st === 'IN_PROGRESS' || st === 'ACTIVE' || st === 'STARTED' || st === 'ON ROUTE';
  }).length;

  const scheduledCount = schedules.filter(s => {
    const st = (s.status || '').toUpperCase();
    return st === 'SCHEDULED' || st === 'PLANNED' || st === 'PENDING';
  }).length;

  return (
    <div className="waste-schedule-page">
      <PageHeader
        title="Waste Collection Scheduling"
        subtitle="Manage daily sweep routes, area assignments, trucks & driver collection schedules"
        onActionClick={() => setIsAddOpen(true)}
        actionLabel="Create Collection Schedule"
      />

      {/* KPI Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f0fdf4', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">schedule</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Total Routes</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>{totalItems}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">today</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Scheduled</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#2563eb' }}>{scheduledCount}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">local_shipping</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>In Progress</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#d97706' }}>{inProgressCount}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">task_alt</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Completed</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#047857' }}>{completedCount}</div>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <button
          onClick={() => { setActiveTab('list'); setPage(1); }}
          style={{
            padding: '0.65rem 1.25rem',
            border: 'none',
            background: 'none',
            fontSize: '0.9rem',
            fontWeight: '700',
            cursor: 'pointer',
            color: activeTab === 'list' ? '#047857' : '#64748b',
            borderBottom: activeTab === 'list' ? '3px solid #10b981' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>list_alt</span>
          Route Schedule List
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          style={{
            padding: '0.65rem 1.25rem',
            border: 'none',
            background: 'none',
            fontSize: '0.9rem',
            fontWeight: '700',
            cursor: 'pointer',
            color: activeTab === 'calendar' ? '#047857' : '#64748b',
            borderBottom: activeTab === 'calendar' ? '3px solid #10b981' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_month</span>
          Weekly Calendar View
        </button>

        <button
          onClick={() => { setActiveTab('today'); setPage(1); }}
          style={{
            padding: '0.65rem 1.25rem',
            border: 'none',
            background: 'none',
            fontSize: '0.9rem',
            fontWeight: '700',
            cursor: 'pointer',
            color: activeTab === 'today' ? '#047857' : '#64748b',
            borderBottom: activeTab === 'today' ? '3px solid #10b981' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>today</span>
          Today's Collections
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'calendar' ? (
        <ScheduleCalendarView onSelectSchedule={handleOpenStatusModal} />
      ) : (
        <>
          <ScheduleFilter
            filters={filters}
            setFilters={setFilters}
            onReset={handleResetFilters}
          />

          <ScheduleSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <ScheduleTable
              schedules={schedules}
              onUpdateStatus={handleOpenStatusModal}
              onAssignTeam={handleOpenAssignModal}
              onDelete={handleDeleteSchedule}
            />
          )}
        </>
      )}

      {/* Modals */}
      <AddScheduleModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={fetchSchedules}
      />

      <ScheduleStatusModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        schedule={selectedSchedule}
        onSuccess={fetchSchedules}
      />

      <AssignRouteWorkersModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        schedule={selectedSchedule}
        onSuccess={fetchSchedules}
      />
    </div>
  );
}
