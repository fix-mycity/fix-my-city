import React, { useState } from 'react';
import { createWasteBin } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export default function AddBinModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    bin_code: '',
    location: '',
    ward: 'Ward 4',
    area: '',
    waste_type: 'General Waste',
    capacity_liters: 1100,
    status: 'ACTIVE'
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location) {
      toast.error('Please enter bin location');
      return;
    }

    setSubmitting(true);
    try {
      await createWasteBin(formData);
      toast.success('Smart Waste Bin added successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to add waste bin.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="waste-modal-overlay">
      <div className="waste-modal-container">
        <div className="waste-modal-header">
          <h3 className="waste-modal-title">Add Waste Bin</h3>
          <button onClick={onClose} className="waste-modal-close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="waste-modal-body">
            <div className="waste-form-group">
              <label className="waste-form-label">Bin Code / Identifier (Optional)</label>
              <input
                type="text"
                placeholder="e.g. BIN-2005"
                className="waste-form-input"
                value={formData.bin_code}
                onChange={(e) => setFormData({ ...formData, bin_code: e.target.value })}
              />
            </div>

            <div className="waste-form-group">
              <label className="waste-form-label">Location Address *</label>
              <input
                type="text"
                required
                placeholder="e.g. Market Gate 2, Main Street"
                className="waste-form-input"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                  placeholder="e.g. Connaught Place"
                  className="waste-form-input"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="waste-form-group">
                <label className="waste-form-label">Waste Category</label>
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
                <label className="waste-form-label">Capacity (Liters)</label>
                <input
                  type="number"
                  className="waste-form-input"
                  value={formData.capacity_liters}
                  onChange={(e) => setFormData({ ...formData, capacity_liters: parseInt(e.target.value) || 1100 })}
                />
              </div>
            </div>
          </div>

          <div className="waste-modal-footer">
            <button type="button" onClick={onClose} className="waste-btn waste-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="waste-btn waste-btn-primary">
              {submitting ? 'Adding...' : 'Save Waste Bin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
