import React, { useState } from 'react';
import { createWasteVehicle } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export default function AddVehicleModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    vehicle_number: '',
    vehicle_type: 'Compactor Truck',
    capacity_tons: 8.0,
    driver_name: '',
    fuel_type: 'Diesel',
    current_location: 'Central Depot Base'
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicle_number) {
      toast.error('Please enter registration number');
      return;
    }

    setSubmitting(true);
    try {
      await createWasteVehicle(formData);
      toast.success('Collection Vehicle added successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to add collection vehicle.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="waste-modal-overlay">
      <div className="waste-modal-container">
        <div className="waste-modal-header">
          <h3 className="waste-modal-title">Add Collection Vehicle</h3>
          <button onClick={onClose} className="waste-modal-close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="waste-modal-body">
            <div className="waste-form-group">
              <label className="waste-form-label">Vehicle Registration Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. MH-12-WM-5050"
                className="waste-form-input"
                value={formData.vehicle_number}
                onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="waste-form-group">
                <label className="waste-form-label">Vehicle Type</label>
                <select
                  className="waste-form-select"
                  value={formData.vehicle_type}
                  onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                >
                  <option value="Compactor Truck">Compactor Truck</option>
                  <option value="Tipper Truck">Tipper Truck</option>
                  <option value="Dump Truck">Dump Truck</option>
                  <option value="Electric Cart">Electric Cart</option>
                </select>
              </div>

              <div className="waste-form-group">
                <label className="waste-form-label">Payload Capacity (Tons)</label>
                <input
                  type="number"
                  step="0.5"
                  className="waste-form-input"
                  value={formData.capacity_tons}
                  onChange={(e) => setFormData({ ...formData, capacity_tons: parseFloat(e.target.value) || 5.0 })}
                />
              </div>
            </div>

            <div className="waste-form-group">
              <label className="waste-form-label">Assigned Driver Name</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                className="waste-form-input"
                value={formData.driver_name}
                onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="waste-form-group">
                <label className="waste-form-label">Fuel Type</label>
                <select
                  className="waste-form-select"
                  value={formData.fuel_type}
                  onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                >
                  <option value="Diesel">Diesel</option>
                  <option value="CNG">CNG</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>

              <div className="waste-form-group">
                <label className="waste-form-label">Depot / Base Location</label>
                <input
                  type="text"
                  placeholder="e.g. Central Yard"
                  className="waste-form-input"
                  value={formData.current_location}
                  onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="waste-modal-footer">
            <button type="button" onClick={onClose} className="waste-btn waste-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="waste-btn waste-btn-primary">
              {submitting ? 'Saving...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
