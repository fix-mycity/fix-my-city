import React, { useState, useEffect } from 'react';
import { updateWasteBinFillLevel } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export function UpdateFillLevelModal({ isOpen, onClose, bin, onSuccess }) {
  const [level, setLevel] = useState(50);
  const [customStatus, setCustomStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && bin) {
      setLevel(bin.fill_level_percentage || 0);
      setCustomStatus(bin.status || '');
    }
  }, [isOpen, bin]);

  if (!isOpen || !bin) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await updateWasteBinFillLevel(bin.id, {
        fill_level_percentage: parseFloat(level),
        status: customStatus || undefined
      });
      toast.success(`Smart Bin ${bin.bin_code} fill level updated to ${level}%!`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to update bin fill level.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="waste-modal-overlay">
      <div className="waste-modal-container">
        <div className="waste-modal-header">
          <h3 className="waste-modal-title">Update Smart Bin Sensor Fill Level</h3>
          <button onClick={onClose} className="waste-modal-close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="waste-modal-body">
            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                Bin #{bin.bin_code} - {bin.location}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                Type: {bin.waste_type} • Current Fill: <strong>{bin.fill_level_percentage}%</strong>
              </div>
            </div>

            <div className="waste-form-group">
              <label className="waste-form-label">Sensor Fill Level Percentage ({level}%)</label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                style={{ width: '100%', accentColor: '#10b981' }}
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                <span>0% (Empty)</span>
                <span>50% (Half Full)</span>
                <span>80% (Full)</span>
                <span>100% (Overflow)</span>
              </div>
            </div>

            <div className="waste-form-group">
              <label className="waste-form-label">Status Override (Optional)</label>
              <select
                className="waste-form-select"
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
              >
                <option value="">-- Auto-calculate based on fill level --</option>
                <option value="Empty">Empty</option>
                <option value="Half Full">Half Full</option>
                <option value="Full">Full</option>
                <option value="Overflow">Overflow</option>
                <option value="Damaged">Damaged</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="waste-modal-footer">
            <button type="button" onClick={onClose} className="waste-btn waste-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="waste-btn waste-btn-primary">
              {submitting ? 'Updating...' : 'Save Sensor Reading'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
