import React, { useState, useEffect } from 'react';
import { updateWasteScheduleStatus } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export function ScheduleStatusModal({ isOpen, onClose, schedule, onSuccess }) {
  const [status, setStatus] = useState('Completed');
  const [binsCount, setBinsCount] = useState(0);
  const [weightTons, setWeightTons] = useState(0.0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && schedule) {
      setStatus(schedule.status || 'Completed');
      setBinsCount(schedule.collected_bins_count || schedule.total_bins_count || 0);
      setWeightTons(schedule.collected_weight_tons || 2.5);
    }
  }, [isOpen, schedule]);

  if (!isOpen || !schedule) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await updateWasteScheduleStatus(schedule.id, {
        status,
        collected_bins_count: parseInt(binsCount),
        collected_weight_tons: parseFloat(weightTons)
      });
      toast.success(`Schedule ${schedule.schedule_code} status updated to ${status}!`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to update collection schedule status.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="waste-modal-overlay">
      <div className="waste-modal-container">
        <div className="waste-modal-header">
          <h3 className="waste-modal-title">Update Route Collection Status</h3>
          <button onClick={onClose} className="waste-modal-close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="waste-modal-body">
            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                #{schedule.schedule_code}: {schedule.route_name}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                Area: {schedule.area || 'Citywide'} ({schedule.ward}) • Type: {schedule.waste_type}
              </div>
            </div>

            <div className="waste-form-group">
              <label className="waste-form-label">Route Collection Status *</label>
              <select
                className="waste-form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Started">Started (In Progress)</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {status === 'Completed' && (
              <>
                <div className="waste-form-group">
                  <label className="waste-form-label">Collected Bins Count *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="waste-form-input"
                    value={binsCount}
                    onChange={(e) => setBinsCount(e.target.value)}
                  />
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Total Bins Scheduled on Route: {schedule.total_bins_count}
                  </div>
                </div>

                <div className="waste-form-group">
                  <label className="waste-form-label">Collected Waste Weight (Tons) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    className="waste-form-input"
                    value={weightTons}
                    onChange={(e) => setWeightTons(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="waste-modal-footer">
            <button type="button" onClick={onClose} className="waste-btn waste-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="waste-btn waste-btn-primary">
              {submitting ? 'Updating...' : 'Save Route Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
