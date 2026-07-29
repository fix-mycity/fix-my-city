import React, { useState } from 'react';
import { createWasteSchedule } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export default function AddScheduleModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    route_name: '',
    ward: 'Ward 4',
    area: 'Connaught Place',
    scheduled_date: new Date().toISOString().split('T')[0],
    scheduled_time: '07:00 AM',
    waste_type: 'General Waste',
    total_bins_count: 10
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.route_name) {
      toast.error('Please enter collection route name');
      return;
    }

    setSubmitting(true);
    try {
      await createWasteSchedule(formData);
      toast.success('Collection schedule created successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to create schedule.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="waste-modal-overlay">
      <div className="waste-modal-container">
        <div className="waste-modal-header">
          <h3 className="waste-modal-title">Create Collection Schedule</h3>
          <button onClick={onClose} className="waste-modal-close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="waste-modal-body">
            <div className="waste-form-group">
              <label className="waste-form-label">Route Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Connaught Place Morning Circuit"
                className="waste-form-input"
                value={formData.route_name}
                onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="waste-form-group">
                <label className="waste-form-label">Ward</label>
                <input
                  type="text"
                  placeholder="e.g. Ward 4"
                  className="waste-form-input"
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                />
              </div>

              <div className="waste-form-group">
                <label className="waste-form-label">Area</label>
                <input
                  type="text"
                  placeholder="e.g. Sector 12"
                  className="waste-form-input"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="waste-form-group">
                <label className="waste-form-label">Scheduled Date</label>
                <input
                  type="date"
                  className="waste-form-input"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                />
              </div>

              <div className="waste-form-group">
                <label className="waste-form-label">Scheduled Time</label>
                <input
                  type="text"
                  placeholder="07:00 AM"
                  className="waste-form-input"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="waste-form-group">
                <label className="waste-form-label">Waste Type</label>
                <select
                  className="waste-form-select"
                  value={formData.waste_type}
                  onChange={(e) => setFormData({ ...formData, waste_type: e.target.value })}
                >
                  <option value="General Waste">General Waste</option>
                  <option value="Organic">Organic Waste</option>
                  <option value="Recyclable">Recyclable</option>
                  <option value="Hazardous">Hazardous</option>
                  <option value="E-Waste">E-Waste</option>
                </select>
              </div>

              <div className="waste-form-group">
                <label className="waste-form-label">Target Bins Count</label>
                <input
                  type="number"
                  className="waste-form-input"
                  value={formData.total_bins_count}
                  onChange={(e) => setFormData({ ...formData, total_bins_count: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          <div className="waste-modal-footer">
            <button type="button" onClick={onClose} className="waste-btn waste-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="waste-btn waste-btn-primary">
              {submitting ? 'Creating...' : 'Create Route Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
