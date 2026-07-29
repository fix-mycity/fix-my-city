import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/wasteManagement/PageHeader';
import { MaintenanceStatusBadge, MaintenancePriorityBadge, AddMaintenanceModal, UpdateMaintenanceStatusModal } from '../../components/wasteManagement/MaintenanceStatusBadge';
import LoadingSkeleton from '../../components/wasteManagement/LoadingSkeleton';

import { getWasteMaintenances, deleteWasteMaintenance } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export default function MaintenanceManagement() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [assetTab, setAssetTab] = useState(''); // '', 'Vehicle', 'Bin', 'Equipment'
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    priority: '',
    status: ''
  });

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize
      };
      if (assetTab) params.asset_type = assetTab;
      if (searchQuery) params.search = searchQuery;
      if (filters.priority) params.priority = filters.priority;
      if (filters.status) params.status = filters.status;

      const res = await getWasteMaintenances(params);
      setTasks(res.data.items || []);
      setTotalItems(res.data.total || 0);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      toast.error('Failed to load asset maintenance work orders.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, assetTab, searchQuery, filters]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this work order?')) {
      try {
        await deleteWasteMaintenance(id);
        toast.success('Work order deleted');
        fetchTasks();
      } catch (err) {
        toast.error('Failed to delete work order.');
      }
    }
  };

  // Stats Calculations
  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress' || t.status === 'Assigned').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;

  return (
    <div className="waste-maintenance-management-page">
      <PageHeader
        title="Waste Asset Maintenance & Work Orders"
        subtitle="Manage fleet truck repairs, smart bin sensor servicing, landfill equipment & preventive work orders"
        onActionClick={() => setIsAddOpen(true)}
        actionLabel="Create Work Order"
      />

      {/* KPI Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">build</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Total Work Orders</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>{totalItems}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Pending Maintenance</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#dc2626' }}>{pendingCount}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">construction</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Active Repairs</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#d97706' }}>{inProgressCount}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">task_alt</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Completed Service</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#047857' }}>{completedCount}</div>
          </div>
        </div>
      </div>

      {/* Asset Module Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        {[
          { key: '', label: 'All Asset Maintenance' },
          { key: 'Vehicle', label: 'Vehicle Fleet Repairs' },
          { key: 'Bin', label: 'Smart Bin Servicing' },
          { key: 'Equipment', label: 'Equipment & Landfill' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setAssetTab(tab.key)}
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.82rem',
              fontWeight: '700',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: assetTab === tab.key ? '#0284c7' : '#f1f5f9',
              color: assetTab === tab.key ? '#ffffff' : '#475569'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', padding: '0.85rem 1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search work order #, asset name, title..."
          className="waste-form-input"
          style={{ flexGrow: 1, maxWidth: '300px', fontSize: '0.85rem' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          className="waste-form-select"
          style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Emergency">Emergency</option>
        </select>

        <select
          className="waste-form-select"
          style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <button
          onClick={() => { setSearchQuery(''); setFilters({ priority: '', status: '' }); }}
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
                  <th style={{ padding: '0.85rem 1rem' }}>Order #</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Asset Type & Name</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Title / Service Details</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Priority</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Assigned Technician</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Repair Cost</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => navigate(`/waste/maintenance/${t.id}`)}
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                    className="hover:bg-slate-50"
                  >
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#0284c7' }}>
                      {t.work_order_number}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{t.asset_name || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.asset_type}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: '#334155' }}>
                      {t.title}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <MaintenancePriorityBadge priority={t.priority} />
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{t.assigned_worker_name || 'Unassigned'}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>₹{t.actual_cost || t.estimated_cost || 0}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Est: ₹{t.estimated_cost || 0}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <MaintenanceStatusBadge status={t.status} />
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/waste/maintenance/${t.id}`); }}
                        title="View Work Order Details"
                        style={{ background: '#f0fdf4', border: '1px solid #d1fae5', color: '#047857', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer', marginRight: '6px' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedTask(t); setIsStatusOpen(true); }}
                        title="Update Status & Cost"
                        style={{ background: '#e0f2fe', border: '1px solid #bae6fd', color: '#0369a1', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer', marginRight: '6px' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>update</span>
                      </button>
                      <button
                        onClick={(e) => handleDelete(t.id, e)}
                        title="Delete Work Order"
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
      <AddMaintenanceModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={fetchTasks}
      />

      <UpdateMaintenanceStatusModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        task={selectedTask}
        onSuccess={fetchTasks}
      />
    </div>
  );
}
