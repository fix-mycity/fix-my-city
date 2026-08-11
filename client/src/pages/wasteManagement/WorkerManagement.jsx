import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/wasteManagement/PageHeader';
import AddWorkerModal from '../../components/wasteManagement/AddWorkerModal';
import LoadingSkeleton from '../../components/wasteManagement/LoadingSkeleton';

import { getWasteWorkers, deleteWasteWorker } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export default function WorkerManagement() {
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    shift: '',
    ward: ''
  });

  // Modal
  const [isAddOpen, setIsAddOpen] = useState(false);

  const fetchWorkers = async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize
      };
      if (searchQuery) params.search = searchQuery;
      if (filters.role) params.role = filters.role;
      if (filters.status) params.status = filters.status;
      if (filters.shift) params.shift = filters.shift;
      if (filters.ward) params.ward = filters.ward;

      const res = await getWasteWorkers(params);
      setWorkers(res.data.items || []);
      setTotalItems(res.data.total || 0);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      toast.error('Failed to load sanitation field workers.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [page, searchQuery, filters]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this worker?')) {
      try {
        await deleteWasteWorker(id);
        toast.success('Worker record removed successfully');
        fetchWorkers();
      } catch (err) {
        toast.error('Failed to delete worker.');
      }
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    const map = {
      Active: { bg: '#d1fae5', color: '#047857', label: 'Active' },
      ACTIVE: { bg: '#d1fae5', color: '#047857', label: 'Active' },
      'On Leave': { bg: '#fef3c7', color: '#b45309', label: 'On Leave' },
      ON_LEAVE: { bg: '#fef3c7', color: '#b45309', label: 'On Leave' },
      Inactive: { bg: '#f1f5f9', color: '#475569', label: 'Inactive' },
      INACTIVE: { bg: '#f1f5f9', color: '#475569', label: 'Inactive' }
    };
    const current = map[status] || map.Active;
    return (
      <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '20px', backgroundColor: current.bg, color: current.color }}>
        {current.label}
      </span>
    );
  };

  // Role Badge Helper
  const getRoleBadge = (role) => {
    const map = {
      Driver: { bg: '#e0f2fe', color: '#0369a1', label: 'Driver' },
      DRIVER: { bg: '#e0f2fe', color: '#0369a1', label: 'Driver' },
      Cleaner: { bg: '#f0fdf4', color: '#047857', label: 'Cleaner' },
      COLLECTOR: { bg: '#f0fdf4', color: '#047857', label: 'Cleaner' },
      Supervisor: { bg: '#f5f3ff', color: '#6d28d9', label: 'Supervisor' },
      SUPERVISOR: { bg: '#f5f3ff', color: '#6d28d9', label: 'Supervisor' },
      Inspector: { bg: '#fff7ed', color: '#c2410c', label: 'Inspector' }
    };
    const current = map[role] || map.Cleaner;
    return (
      <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.15rem 0.5rem', borderRadius: '6px', backgroundColor: current.bg, color: current.color }}>
        {current.label}
      </span>
    );
  };

  // KPI Calculations
  const activeWorkers = workers.filter(w => {
    const s = (w.status || '').toUpperCase();
    return s === 'ACTIVE';
  }).length;
  const driversCount = workers.filter(w => {
    const r = (w.role || '').toUpperCase();
    return r === 'DRIVER';
  }).length;
  const cleanersCount = workers.filter(w => {
    const r = (w.role || '').toUpperCase();
    return r === 'CLEANER' || r === 'COLLECTOR' || r === 'COLLECTORS';
  }).length;

  return (
    <div className="waste-worker-management-page">
      <PageHeader
        title="Sanitation Workers Roster"
        subtitle="Manage field sanitation cleaners, truck drivers, supervisors, inspectors, shifts & ward assignments"
        onActionClick={() => setIsAddOpen(true)}
        actionLabel="Register Field Worker"
        actionIcon="person_add"
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
            <span className="material-symbols-outlined">engineering</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Total Roster</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>{totalItems}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">badge</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Active On Duty</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#047857' }}>{activeWorkers}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">time_to_leave</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Truck Drivers</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0284c7' }}>{driversCount}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f5f3ff', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">cleaning_services</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Cleaners / Collectors</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#6d28d9' }}>{cleanersCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', padding: '0.85rem 1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search worker ID, name, phone, ward..."
          className="waste-form-input"
          style={{ flexGrow: 1, maxWidth: '300px', fontSize: '0.85rem' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          className="waste-form-select"
          style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        >
          <option value="">All Roles</option>
          <option value="Cleaner">Cleaner</option>
          <option value="Driver">Driver</option>
          <option value="Supervisor">Supervisor</option>
          <option value="Inspector">Inspector</option>
        </select>

        <select
          className="waste-form-select"
          style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
          value={filters.shift}
          onChange={(e) => setFilters({ ...filters, shift: e.target.value })}
        >
          <option value="">All Shifts</option>
          <option value="Morning">Morning Shift</option>
          <option value="Evening">Evening Shift</option>
          <option value="Night">Night Shift</option>
        </select>

        <select
          className="waste-form-select"
          style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Inactive">Inactive</option>
        </select>

        <button
          onClick={() => { setSearchQuery(''); setFilters({ role: '', status: '', shift: '', ward: '' }); }}
          className="waste-btn waste-btn-secondary"
          style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
        >
          Reset
        </button>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '700' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Worker ID</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Full Name</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Staff Role</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Phone & Email</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Assigned Ward</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Shift</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w) => (
                  <tr
                    key={w.id}
                    onClick={() => navigate(`/waste/workers/${w.id}`)}
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                    className="hover:bg-slate-50"
                  >
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#047857' }}>
                      #{w.worker_id_number}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: '#0f172a' }}>
                      {w.name}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {getRoleBadge(w.role)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: '500', color: '#334155' }}>{w.phone}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{w.email || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: '#334155' }}>
                      {w.ward || 'General'} ({w.area || 'Citywide'})
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.15rem 0.5rem', backgroundColor: '#f1f5f9', borderRadius: '6px', color: '#334155' }}>
                        {w.shift || 'MORNING'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {getStatusBadge(w.status)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/waste/workers/${w.id}`); }}
                        title="View Worker Profile"
                        style={{ background: '#f0fdf4', border: '1px solid #d1fae5', color: '#047857', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer', marginRight: '6px' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/waste/workers/${w.id}/edit`); }}
                        title="Edit Worker Profile"
                        style={{ background: '#e0f2fe', border: '1px solid #bae6fd', color: '#0369a1', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer', marginRight: '6px' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                      </button>
                      <button
                        onClick={(e) => handleDelete(w.id, e)}
                        title="Remove Worker"
                        style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddWorkerModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={fetchWorkers}
      />
    </div>
  );
}
