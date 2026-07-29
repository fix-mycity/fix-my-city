import React, { useState } from 'react';
import { createWasteComplaint } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export default function AddComplaintModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Overflowing Bin',
    priority: 'MEDIUM',
    ward: 'Ward 4',
    area: 'Connaught Place',
    address: '',
    citizen_name: '',
    phone: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Please enter a complaint title');
      return;
    }

    setSubmitting(true);
    try {
      await createWasteComplaint(formData);
      toast.success('Waste Complaint logged successfully!');
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        title: '',
        category: 'Overflowing Bin',
        priority: 'MEDIUM',
        ward: 'Ward 4',
        area: 'Connaught Place',
        address: '',
        citizen_name: '',
        phone: '',
        description: ''
      });
    } catch (err) {
      toast.error('Failed to log waste complaint.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="waste-modal-overlay">
      <div className="waste-modal-container">
        <div className="waste-modal-header">
          <h3 className="waste-modal-title">File Waste Management Complaint</h3>
          <button onClick={onClose} className="waste-modal-close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="waste-modal-body">
            <div className="waste-form-group">
              <label className="waste-form-label">Complaint Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Overflowing bin at Sector 4 Market"
                className="waste-form-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="waste-form-group">
                <label className="waste-form-label">Category</label>
                <select
                  className="waste-form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Overflowing Bin">Overflowing Bin</option>
                  <option value="Missed Pickup">Missed Pickup</option>
                  <option value="Hazardous Waste">Hazardous Waste</option>
                  <option value="Organic Waste">Organic Waste</option>
                  <option value="Unsafe Dumping">Unsafe Dumping</option>
                  <option value="Damaged Bin">Damaged Bin</option>
                </select>
              </div>

              <div className="waste-form-group">
                <label className="waste-form-label">Priority</label>
                <select
                  className="waste-form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
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
                  placeholder="e.g. Connaught Place"
                  className="waste-form-input"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="waste-form-group">
                <label className="waste-form-label">Complainant Name</label>
                <input
                  type="text"
                  placeholder="e.g. Priyam Sharma"
                  className="waste-form-input"
                  value={formData.citizen_name}
                  onChange={(e) => setFormData({ ...formData, citizen_name: e.target.value })}
                />
              </div>

              <div className="waste-form-group">
                <label className="waste-form-label">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  className="waste-form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="waste-form-group">
              <label className="waste-form-label">Detailed Description</label>
              <textarea
                rows="3"
                placeholder="Provide additional location details or issue context..."
                className="waste-form-input"
                style={{ resize: 'vertical' }}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="waste-modal-footer">
            <button type="button" onClick={onClose} className="waste-btn waste-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="waste-btn waste-btn-primary">
              {submitting ? 'Submitting...' : 'Log Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
