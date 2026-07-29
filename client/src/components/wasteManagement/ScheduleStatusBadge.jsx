import React, { useState, useEffect } from 'react';
import { getWasteVehicles, getWasteWorkers, assignWasteScheduleWorkers } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export function ScheduleStatusBadge({ status }) {
  const styles = {
    Planned: { bg: '#e0f2fe', color: '#0369a1', label: 'Planned' },
    Scheduled: { bg: '#e0f2fe', color: '#0369a1', label: 'Planned' },
    Active: { bg: '#fef3c7', color: '#b45309', label: 'Active' },
    Started: { bg: '#fef3c7', color: '#b45309', label: 'Active' },
    Completed: { bg: '#d1fae5', color: '#047857', label: 'Completed' },
    Cancelled: { bg: '#fef2f2', color: '#b91c1c', label: 'Cancelled' }
  };

  const current = styles[status] || styles.Planned;

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

export function AssignRouteWorkersModal({ isOpen, onClose, schedule, onSuccess }) {
  const [vehicles, setVehicles] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [assignedWorkerIds, setAssignedWorkerIds] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
      if (schedule) {
        setVehicleId(schedule.vehicle_id ? schedule.vehicle_id.toString() : '');
        setDriverId(schedule.driver_worker_id ? schedule.driver_worker_id.toString() : '');
        setAssignedWorkerIds(schedule.assigned_worker_ids || '');
      }
    }
  }, [isOpen, schedule]);

  const fetchOptions = async () => {
    try {
      const [vRes, wRes] = await Promise.all([getWasteVehicles(), getWasteWorkers()]);
      setVehicles(vRes.data.items || []);
      setWorkers(wRes.data.items || []);
    } catch (err) {
      toast.error('Failed to load fleet and workers dropdown list.');
    }
  };

  if (!isOpen || !schedule) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await assignWasteScheduleWorkers(schedule.id, {
        vehicle_id: vehicleId ? parseInt(vehicleId) : undefined,
        driver_worker_id: driverId ? parseInt(driverId) : undefined,
        assigned_worker_ids: assignedWorkerIds
      });
      toast.success(`Route ${schedule.route_name} team assigned successfully!`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to assign team to collection route.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="waste-modal-overlay">
      <div className="waste-modal-container">
        <div className="waste-modal-header">
          <h3 className="waste-modal-title">Assign Vehicle & Workers Team</h3>
          <button onClick={onClose} className="waste-modal-close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="waste-modal-body">
            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                Route: {schedule.route_name} ({schedule.schedule_code})
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                Ward: {schedule.ward || 'General'} • Distance: {schedule.distance_km || 12.5} km
              </div>
            </div>

            <div className="waste-form-group">
              <label className="waste-form-label">Assign Collection Vehicle</label>
              <select
                className="waste-form-select"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
              >
                <option value="">-- Choose Collection Vehicle --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vehicle_number} ({v.vehicle_type} - {v.capacity_tons} Tons)
                  </option>
                ))}
              </select>
            </div>

            <div className="waste-form-group">
              <label className="waste-form-label">Assign Truck Driver</label>
              <select
                className="waste-form-select"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
              >
                <option value="">-- Choose Truck Driver --</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.role || 'Staff'}) {w.phone ? `- ${w.phone}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="waste-form-group">
              <label className="waste-form-label">Sanitation Crew Worker IDs (Comma separated)</label>
              <input
                type="text"
                placeholder="e.g. 3, 4"
                className="waste-form-input"
                value={assignedWorkerIds}
                onChange={(e) => setAssignedWorkerIds(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Enter worker IDs separated by commas</span>
            </div>
          </div>

          <div className="waste-modal-footer">
            <button type="button" onClick={onClose} className="waste-btn waste-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="waste-btn waste-btn-primary">
              {submitting ? 'Saving...' : 'Save Assignments'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
