import React, { useState, useEffect } from 'react';
import { getPipelines } from '../../services/pipelineService';

const TANK_TYPES = ['OVERHEAD_TANK', 'UNDERGROUND_TANK', 'RESERVOIR', 'TANKER'];
const STATUSES = ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'EMPTY', 'FULL', 'LOW_LEVEL'];

export default function TankForm({ initialData = {}, onSubmit, onCancel, isEdit = false }) {
  const [formData, setFormData] = useState({
    tank_number: initialData.tank_number || '',
    tank_name: initialData.tank_name || '',
    tank_type: initialData.tank_type || 'OVERHEAD_TANK',
    zone: initialData.zone || '',
    ward: initialData.ward || '',
    area: initialData.area || '',
    address: initialData.address || '',
    latitude: initialData.latitude || '',
    longitude: initialData.longitude || '',
    capacity_liters: initialData.capacity_liters || '',
    current_level_liters: initialData.current_level_liters || '',
    minimum_level: initialData.minimum_level || '',
    maximum_level: initialData.maximum_level || '',
    water_source: initialData.water_source || '',
    pipeline_id: initialData.pipeline_id || '',
    installation_date: initialData.installation_date || '',
    last_cleaned_date: initialData.last_cleaned_date || '',
    next_cleaning_date: initialData.next_cleaning_date || '',
    status: initialData.status || 'ACTIVE',
    remarks: initialData.remarks || ''
  });

  const [pipelines, setPipelines] = useState([]);

  useEffect(() => {
    const fetchPipelines = async () => {
      try {
        const response = await getPipelines({ page: 1, page_size: 100 });
        setPipelines(response.data.items);
      } catch (err) {
        console.error("Could not load pipelines list:", err);
      }
    };
    fetchPipelines();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!formData.ward.trim() || !formData.area.trim()) {
      alert("Ward and Area are required.");
      return;
    }

    const capacity = parseFloat(formData.capacity_liters);
    if (isNaN(capacity) || capacity <= 0) {
      alert("Tank capacity must be a positive number.");
      return;
    }

    const currentLevel = formData.current_level_liters ? parseFloat(formData.current_level_liters) : 0;
    if (currentLevel < 0) {
      alert("Water level cannot be negative.");
      return;
    }
    if (currentLevel > capacity) {
      alert("Water level cannot exceed tank capacity.");
      return;
    }

    // Convert values
    const payload = {
      ...formData,
      capacity_liters: capacity,
      current_level_liters: currentLevel,
      minimum_level: formData.minimum_level ? parseFloat(formData.minimum_level) : null,
      maximum_level: formData.maximum_level ? parseFloat(formData.maximum_level) : null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      pipeline_id: formData.pipeline_id ? parseInt(formData.pipeline_id) : null,
      installation_date: formData.installation_date || null,
      last_cleaned_date: formData.last_cleaned_date || null,
      next_cleaning_date: formData.next_cleaning_date || null
    };

    if (!payload.tank_number.trim()) {
      delete payload.tank_number; // database auto-generates if empty
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleFormSubmit} className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.75rem', margin: 0 }}>
        {isEdit ? `Edit Tank: ${initialData.tank_number}` : 'Register New Water Tank'}
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div>
          <label className="water-label">Tank Number (Leave blank to auto-generate)</label>
          <input 
            type="text" 
            name="tank_number"
            value={formData.tank_number}
            onChange={handleChange}
            placeholder="e.g. WTK-100239"
            disabled={isEdit}
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">Tank Name / Identifier</label>
          <input 
            type="text" 
            name="tank_name"
            value={formData.tank_name}
            onChange={handleChange}
            placeholder="e.g. South Overhead Tank A"
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">Tank Type</label>
          <select 
            name="tank_type" 
            value={formData.tank_type} 
            onChange={handleChange}
            className="water-input"
          >
            {TANK_TYPES.map(t => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Location */}
      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: '0.5rem 0 0 0', letterSpacing: '0.5px' }}>
        Location & Address
      </h4>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div>
          <label className="water-label">Zone</label>
          <input 
            type="text" 
            name="zone"
            value={formData.zone}
            onChange={handleChange}
            placeholder="e.g. Zone 1"
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">Ward *</label>
          <input 
            type="text" 
            name="ward"
            value={formData.ward}
            onChange={handleChange}
            placeholder="e.g. Ward 3"
            required
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">Area *</label>
          <input 
            type="text" 
            name="area"
            value={formData.area}
            onChange={handleChange}
            placeholder="e.g. South Extension"
            required
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">GPS Latitude</label>
          <input 
            type="number" 
            step="0.000001"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="e.g. 12.9715987"
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">GPS Longitude</label>
          <input 
            type="number" 
            step="0.000001"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="e.g. 77.5945622"
            className="water-input"
          />
        </div>
      </div>

      <div>
        <label className="water-label">Full Address Description</label>
        <input 
          type="text" 
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="e.g. Near Community Center, Main Road"
          className="water-input"
        />
      </div>

      {/* Volumetric details */}
      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: '0.5rem 0 0 0', letterSpacing: '0.5px' }}>
        Volumetrics & System Connections
      </h4>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div>
          <label className="water-label">Tank Capacity (Liters) *</label>
          <input 
            type="number" 
            name="capacity_liters"
            value={formData.capacity_liters}
            onChange={handleChange}
            placeholder="e.g. 50000"
            required
            className="water-input"
          />
        </div>

        {!isEdit && (
          <div>
            <label className="water-label">Initial Water Level (Liters)</label>
            <input 
              type="number" 
              name="current_level_liters"
              value={formData.current_level_liters}
              onChange={handleChange}
              placeholder="e.g. 25000"
              className="water-input"
            />
          </div>
        )}

        <div>
          <label className="water-label">Min Alert level (Liters)</label>
          <input 
            type="number" 
            name="minimum_level"
            value={formData.minimum_level}
            onChange={handleChange}
            placeholder="e.g. 10000"
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">Max Alert Level (Liters)</label>
          <input 
            type="number" 
            name="maximum_level"
            value={formData.maximum_level}
            onChange={handleChange}
            placeholder="e.g. 48000"
            className="water-input"
          />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div>
          <label className="water-label">Water Feed Source</label>
          <input 
            type="text" 
            name="water_source"
            value={formData.water_source}
            onChange={handleChange}
            placeholder="e.g. River Pump Station 3"
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">Connected Pipeline</label>
          <select 
            name="pipeline_id" 
            value={formData.pipeline_id} 
            onChange={handleChange}
            className="water-input"
          >
            <option value="">No connection / Independent</option>
            {pipelines.map(p => (
              <option key={p.id} value={p.id}>{p.pipeline_number} ({p.pipeline_name || 'Unnamed'})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="water-label">Installation Date</label>
          <input 
            type="date" 
            name="installation_date"
            value={formData.installation_date}
            onChange={handleChange}
            className="water-input"
          />
        </div>
      </div>

      {/* Cleaning History */}
      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: '0.5rem 0 0 0', letterSpacing: '0.5px' }}>
        Cleaning Schedule
      </h4>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div>
          <label className="water-label">Last Cleaned Date</label>
          <input 
            type="date" 
            name="last_cleaned_date"
            value={formData.last_cleaned_date}
            onChange={handleChange}
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">Next Cleaning Scheduled Date</label>
          <input 
            type="date" 
            name="next_cleaning_date"
            value={formData.next_cleaning_date}
            onChange={handleChange}
            className="water-input"
          />
        </div>

        {isEdit && (
          <div>
            <label className="water-label">Operational Status</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
              className="water-input"
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="water-label">Remarks & Instructions</label>
        <textarea 
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          placeholder="Enter comments, guidelines..."
          rows="3"
          className="water-input"
        />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button 
          type="button" 
          onClick={onCancel}
          className="water-btn"
          style={{ borderColor: 'var(--water-border)', color: 'var(--water-text)' }}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="water-btn"
          style={{ backgroundColor: 'var(--water-primary)', color: '#ffffff', border: 'none' }}
        >
          {isEdit ? 'Save Changes' : 'Register Water Tank'}
        </button>
      </div>
    </form>
  );
}
