import React, { useState, useEffect } from 'react';
import { getWasteWorkers, createWasteMaintenance, updateWasteMaintenanceStatus } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export function MaintenanceStatusBadge({ status }) {
  const styles = {
    Pending: { bg: '#fee2e2', color: '#b91c1c', label: 'Pending' },
    Assigned: { bg: '#e0f2fe', color: '#0369a1', label: 'Assigned' },
    'In Progress': { bg: '#fef3c7', color: '#b45309', label: 'In Progress' },
    Completed: { bg: '#d1fae5', color: '#047857', label: 'Completed' }
  };

  const current = styles[status] || styles.Pending;

  return (
    <span style={{
      fontSize: '0.75rem',
      fontWeight: '700',
      padding: '0.2rem 0.6rem',
      borderRadius: '20px',
      backgroundColor: current.bg,
      color: current.color,
      display: 'inline-block',
      whiteSpace: 'nowrap'
    }}>
      {current.label}
    </span>
  );
}

export function MaintenancePriorityBadge({ priority }) {
  const styles = {
    Low: { bg: '#f1f5f9', color: '#475569' },
    Medium: { bg: '#eff6ff', color: '#1d4ed8' },
    High: { bg: '#fff7ed', color: '#c2410c' },
    Emergency: { bg: '#fef2f2', color: '#b91c1c' }
  };

  const current = styles[priority] || styles.Medium;

  return (
    <span style={{
      fontSize: '0.75rem',
      fontWeight: '700',
      padding: '0.15rem 0.5rem',
      borderRadius: '6px',
      backgroundColor: current.bg,
      color: current.color,
      display: 'inline-block'
    }}>
      {priority || 'Medium'}
    </span>
  );
}

export function AddMaintenanceModal({ isOpen, onClose, onSuccess }) {
  const [workers, setWorkers] = useState([]);
  const [formData, setFormData] = useState({
    asset_type: 'Vehicle',
    asset_name: '',
    title: '',
    description: '',
    priority: 'Medium',
    assigned_worker_id: '',
    estimated_cost: '5000'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchWorkers();
    }
  }, [isOpen]);

  const fetchWorkers = async () => {
    try {
      const res = await getWasteWorkers();
      setWorkers(res.data.items || []);
    } catch (err) {
      toast.error('Failed to load workers dropdown list.');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        assigned_worker_id: formData.assigned_worker_id ? parseInt(formData.assigned_worker_id) : undefined,
        estimated_cost: parseFloat(formData.estimated_cost) || 0.0
      };

      await createWasteMaintenance(payload);
      toast.success('Maintenance work order issued successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to create maintenance work order.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="waste-modal-overlay">
      <div className="waste-modal-container">
        <div className="waste-modal-header">
          <h3 className="waste-modal-title">Create Maintenance Work Order</h3>
          <button onClick={onClose} className="waste-modal-close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="waste-modal-body">
            <div className="waste-form-group">
              <label className="waste-form-label">Asset Category Module *</label>
              <select
                className="waste-form-select"
                value={formData.asset_type}
                onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
              >
                <option value="Vehicle">Vehicle Maintenance</option>
                <option value="Bin">Smart Bin Maintenance</option>
                <option value="Equipment">Depot Equipment & Landfill</option>
              </select>
            </div>

            <div className="waste-form-group">
              <label className="waste-form-label">Target Asset Identifier / Name *</label>
              <input
                type="text"
                placeholder="e.g. MH-12-WM-1005 (Compactor) or BIN-1008"
                className="waste-form-input"
                required
                value={formData.asset_name}
                onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
              />
            </div>

            <div className="waste-form-group">
              <label className="waste-form-label">Work Order Title *</label>
              <input
                type="text"
                placeholder="e.g. Hydraulic cylinder seal repair"
                className="waste-form-input"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="waste-form-group">
              <label className="waste-form-label">Issue Description</label>
              <textarea
                className="waste-form-textarea"
                rows="3"
                placeholder="Detailed description of defect or service required..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="waste-form-group">
                <label className="waste-form-label">Priority Level *</label>
                <select
                  className="waste-form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div className="waste-form-group">
                <label className="waste-form-label">Estimated Repair Cost (₹)</label>
                <input
                  type="number"
                  className="waste-form-input"
                  value={formData.estimated_cost}
                  onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                />
              </div>
            </div>

            <div className="waste-form-group">
              <label className="waste-form-label">Assign Maintenance Technician</label>
              <select
                className="waste-form-select"
                value={formData.assigned_worker_id}
                onChange={(e) => setFormData({ ...formData, assigned_worker_id: e.target.value })}
              >
                <option value="">-- Unassigned --</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.role} - {w.ward || 'General'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="waste-modal-footer">
            <button type="button" onClick={onClose} className="waste-btn waste-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="waste-btn waste-btn-primary">
              {submitting ? 'Creating Work Order...' : 'Issue Work Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function UpdateMaintenanceStatusModal({ isOpen, onClose, task, onSuccess }) {
  const [status, setStatus] = useState('Pending');
  const [actualCost, setActualCost] = useState('0');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      setStatus(task.status || 'Pending');
      setActualCost(task.actual_cost ? task.actual_cost.toString() : '0');
      setResolutionNotes(task.resolution_notes || '');
    }
  }, [isOpen, task]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await updateWasteMaintenanceStatus(task.id, {
        status,
        actual_cost: parseFloat(actualCost) || 0.0,
        resolution_notes: resolutionNotes
      });
      toast.success(`Work Order #${task.work_order_number} status set to ${status}!`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to update maintenance status.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="waste-modal-overlay">
      <div className="waste-modal-container">
        <div className="waste-modal-header">
          <h3 className="waste-modal-title">Update Work Order Status</h3>
          <button onClick={onClose} className="waste-modal-close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="waste-modal-body">
            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                Work Order #{task.work_order_number}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                Asset: {task.asset_name} ({task.asset_type})
              </div>
            </div>

            <div className="waste-form-group">
              <label className="waste-form-label">Maintenance Work Status *</label>
              <select
                className="waste-form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="waste-form-group">
              <label className="waste-form-label">Actual Maintenance Repair Cost (₹)</label>
              <input
                type="number"
                className="waste-form-input"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
              />
            </div>

            <div className="waste-form-group">
              <label className="waste-form-label">Resolution & Service Notes</label>
              <textarea
                className="waste-form-textarea"
                rows="3"
                placeholder="Log repairs performed, replaced parts, or testing results..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="waste-modal-footer">
            <button type="button" onClick={onClose} className="waste-btn waste-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="waste-btn waste-btn-primary">
              {submitting ? 'Saving...' : 'Save Work Order Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
