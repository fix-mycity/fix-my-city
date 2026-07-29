import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/wasteManagement/PageHeader';
import { MaintenanceStatusBadge, MaintenancePriorityBadge, UpdateMaintenanceStatusModal } from '../../components/wasteManagement/MaintenanceStatusBadge';
import LoadingSkeleton from '../../components/wasteManagement/LoadingSkeleton';

import { getWasteMaintenanceById, deleteWasteMaintenance } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export default function MaintenanceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const fetchTaskDetails = async () => {
    setLoading(true);
    try {
      const res = await getWasteMaintenanceById(id);
      setTask(res.data);
    } catch (err) {
      toast.error('Failed to load maintenance work order details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete work order #${task.work_order_number}?`)) {
      try {
        await deleteWasteMaintenance(task.id);
        toast.success('Work order deleted');
        navigate('/waste/maintenance');
      } catch (err) {
        toast.error('Failed to delete work order.');
      }
    }
  };

  if (loading || !task) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="waste-maintenance-details-page">
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => navigate('/waste/maintenance')}
          className="waste-btn waste-btn-secondary"
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          Back to Asset Maintenance
        </button>
      </div>

      <PageHeader
        title={`Work Order #${task.work_order_number}`}
        subtitle={`${task.asset_type} Maintenance • ${task.asset_name}`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Work Order Info */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <MaintenancePriorityBadge priority={task.priority} />
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  {task.title}
                </h2>
              </div>
              <MaintenanceStatusBadge status={task.status} />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                Issue Description
              </div>
              <div style={{ fontSize: '0.92rem', color: '#334155', lineHeight: '1.5', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                {task.description || 'No detailed description provided.'}
              </div>
            </div>

            {/* Asset Metadata */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #d1fae5' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: '700', textTransform: 'uppercase' }}>Target Asset</div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>{task.asset_name}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: '700', textTransform: 'uppercase' }}>Asset Category</div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>{task.asset_type} Module</div>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#0284c7', fontSize: '20px' }}>payments</span>
              Financial Cost Breakdown
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Estimated Budget</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
                  ₹{task.estimated_cost || 0}
                </div>
              </div>

              <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: '700', textTransform: 'uppercase' }}>Actual Repair Cost</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1d4ed8', marginTop: '0.2rem' }}>
                  ₹{task.actual_cost || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Service & Resolution Notes */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: '20px' }}>history_edu</span>
              Resolution & Service Notes
            </h3>

            <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.5', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {task.resolution_notes ? (
                <div>
                  <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '0.3rem' }}>Service Summary:</div>
                  <div>{task.resolution_notes}</div>
                  {task.completed_at && (
                    <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '0.5rem', fontWeight: '700' }}>
                      Completed on {new Date(task.completed_at).toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                  No resolution notes logged yet. Work order is currently in {task.status} status.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Assigned Technician */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#6d28d9', fontSize: '20px' }}>engineering</span>
              Assigned Technician
            </h3>

            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>
              {task.assigned_worker_name || 'Unassigned'}
            </div>
          </div>

          {/* Operations Actions */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem 0' }}>
              Work Order Actions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => setIsStatusOpen(true)}
                className="waste-btn waste-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>update</span>
                Update Status & Cost
              </button>

              <button
                onClick={handleDelete}
                className="waste-btn"
                style={{ width: '100%', justifyContent: 'center', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                Delete Work Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UpdateMaintenanceStatusModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        task={task}
        onSuccess={fetchTaskDetails}
      />
    </div>
  );
}
