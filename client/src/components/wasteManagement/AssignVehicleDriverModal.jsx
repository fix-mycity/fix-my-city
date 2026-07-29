import React, { useState, useEffect } from 'react';
import { getWasteWorkers, getWasteSchedules, assignWasteVehicleDriverRoute, updateWasteVehicleStatus } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export function AssignVehicleDriverModal({ isOpen, onClose, vehicle, onSuccess }) {
  const [workers, setWorkers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [driverId, setDriverId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
      if (vehicle) {
        setDriverId(vehicle.driver_id ? vehicle.driver_id.toString() : '');
        setRouteId(vehicle.assigned_route_id ? vehicle.assigned_route_id.toString() : '');
      }
    }
  }, [isOpen, vehicle]);

  const fetchOptions = async () => {
    try {
      const [wRes, sRes] = await Promise.all([getWasteWorkers(), getWasteSchedules()]);
      setWorkers(wRes.data.items || []);
      setSchedules(sRes.data.items || []);
    } catch (err) {
      toast.error('Failed to load workers/routes list');
    }
  };

  if (!isOpen || !vehicle) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await assignWasteVehicleDriverRoute(vehicle.id, {
        driver_id: driverId ? parseInt(driverId) : undefined,
        assigned_route_id: routeId ? parseInt(routeId) : undefined
      });
      toast.success(`Vehicle ${vehicle.vehicle_number} assignments updated!`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to update vehicle assignments.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="waste-modal-overlay">
      <div className="waste-modal-container">
        <div className="waste-modal-header">
          <h3 className="waste-modal-title">Assign Driver & Collection Route</h3>
          <button onClick={onClose} className="waste-modal-close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="waste-modal-body">
            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                Vehicle Reg #{vehicle.vehicle_number} ({vehicle.vehicle_type})
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                Payload: {vehicle.capacity_tons} Tons • Fuel: {vehicle.fuel_type}
              </div>
            </div>

            <div className="waste-form-group">
              <label className="waste-form-label">Assign Driver Worker</label>
              <select
                className="waste-form-select"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
              >
                <option value="">-- Choose Truck Driver --</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.role} - {w.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="waste-form-group">
              <label className="waste-form-label">Assign Collection Route Schedule</label>
              <select
                className="waste-form-select"
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
              >
                <option value="">-- Choose Collection Route --</option>
                {schedules.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.route_name} ({s.schedule_code} - {s.ward})
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
              {submitting ? 'Saving...' : 'Save Assignments'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function UpdateVehicleStatusModal({ isOpen, onClose, vehicle, onSuccess }) {
  const [status, setStatus] = useState('Available');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && vehicle) {
      setStatus(vehicle.status || 'Available');
      setLocation(vehicle.current_location || '');
    }
  }, [isOpen, vehicle]);

  if (!isOpen || !vehicle) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await updateWasteVehicleStatus(vehicle.id, {
        status,
        current_location: location
      });
      toast.success(`Vehicle ${vehicle.vehicle_number} status set to ${status}!`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to update vehicle status.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="waste-modal-overlay">
      <div className="waste-modal-container">
        <div className="waste-modal-header">
          <h3 className="waste-modal-title">Update Fleet Status & Location</h3>
          <button onClick={onClose} className="waste-modal-close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="waste-modal-body">
            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                Vehicle Reg #{vehicle.vehicle_number}
              </div>
            </div>

            <div className="waste-form-group">
              <label className="waste-form-label">Operational Status *</label>
              <select
                className="waste-form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Available">Available (Ready)</option>
                <option value="On Route">On Route (In Service)</option>
                <option value="Maintenance">Maintenance Workshop</option>
                <option value="Breakdown">Breakdown Emergency</option>
              </select>
            </div>

            <div className="waste-form-group">
              <label className="waste-form-label">GPS Telemetry Location</label>
              <input
                type="text"
                placeholder="Current location / depot depot area..."
                className="waste-form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="waste-modal-footer">
            <button type="button" onClick={onClose} className="waste-btn waste-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="waste-btn waste-btn-primary">
              {submitting ? 'Updating...' : 'Save Fleet Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
