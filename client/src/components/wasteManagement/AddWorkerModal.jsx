import React, { useState } from 'react';
import { createWasteWorker } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export default function AddWorkerModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'Cleaner',
    ward: 'Ward 4',
    area: 'Connaught Place',
    shift: 'MORNING'
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Please enter name and phone number');
      return;
    }

    setSubmitting(true);
    try {
      await createWasteWorker(formData);
      toast.success('Sanitation Worker registered successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to register worker.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="waste-modal-overlay">
      <div className="waste-modal-container">
        <div className="waste-modal-header">
          <h3 className="waste-modal-title">Register Sanitation Worker</h3>
          <button onClick={onClose} className="waste-modal-close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="waste-modal-body">
            <div className="waste-form-group">
              <label className="waste-form-label">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                className="waste-form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="waste-form-group">
                <label className="waste-form-label">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 9876543210"
                  className="waste-form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="waste-form-group">
                <label className="waste-form-label">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="ramesh@city.gov.in"
                  className="waste-form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="waste-form-group">
                <label className="waste-form-label">Role</label>
                <select
                  className="waste-form-select"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="Cleaner">Cleaner (Collector)</option>
                  <option value="Driver">Driver</option>
                  <option value="Supervisor">Supervisor</option>
                </select>
              </div>

              <div className="waste-form-group">
                <label className="waste-form-label">Shift</label>
                <select
                  className="waste-form-select"
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                >
                  <option value="MORNING">Morning Shift</option>
                  <option value="EVENING">Evening Shift</option>
                  <option value="NIGHT">Night Shift</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="waste-form-group">
                <label className="waste-form-label">Assigned Ward</label>
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
                  placeholder="e.g. Connaught Place"
                  className="waste-form-input"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="waste-modal-footer">
            <button type="button" onClick={onClose} className="waste-btn waste-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="waste-btn waste-btn-primary">
              {submitting ? 'Registering...' : 'Register Worker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
