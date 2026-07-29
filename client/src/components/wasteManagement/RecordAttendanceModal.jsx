import React, { useState } from 'react';
import { recordWasteWorkerAttendance } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export function RecordAttendanceModal({ isOpen, onClose, worker, onSuccess }) {
  const [status, setStatus] = useState('Present');
  const [checkInTime, setCheckInTime] = useState('08:00 AM');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !worker) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await recordWasteWorkerAttendance(worker.id, {
        status,
        check_in_time: checkInTime
      });
      toast.success(`Attendance marked as ${status} for ${worker.name}!`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to record attendance.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="waste-modal-overlay">
      <div className="waste-modal-container">
        <div className="waste-modal-header">
          <h3 className="waste-modal-title">Record Daily Attendance</h3>
          <button onClick={onClose} className="waste-modal-close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="waste-modal-body">
            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                {worker.name} (ID: #{worker.worker_id_number})
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                Role: {worker.role} • Ward: {worker.ward || 'General'}
              </div>
            </div>

            <div className="waste-form-group">
              <label className="waste-form-label">Attendance Status *</label>
              <select
                className="waste-form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Present">Present (On Duty)</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>

            {status === 'Present' && (
              <div className="waste-form-group">
                <label className="waste-form-label">Check-In Time</label>
                <input
                  type="text"
                  placeholder="e.g. 07:30 AM"
                  className="waste-form-input"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="waste-modal-footer">
            <button type="button" onClick={onClose} className="waste-btn waste-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="waste-btn waste-btn-primary">
              {submitting ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
