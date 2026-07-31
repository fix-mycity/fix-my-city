import React, { useState, useEffect } from 'react';
import { getPipelines } from '../../services/pipelineService';

const TANK_TYPES = [
  { value: 'OVERHEAD_TANK', label: 'Overhead Reservoir Tank' },
  { value: 'UNDERGROUND_TANK', label: 'Underground Sump / Tank' },
  { value: 'RESERVOIR', label: 'Central Water Reservoir' },
  { value: 'TANKER', label: 'Mobile Water Tanker' }
];

const STATUSES = [
  { value: 'ACTIVE', label: 'Active (Operational)' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'UNDER_MAINTENANCE', label: 'Under Maintenance' },
  { value: 'EMPTY', label: 'Empty' },
  { value: 'FULL', label: 'Full Capacity' },
  { value: 'LOW_LEVEL', label: 'Low Level Warning' }
];

const MUNICIPAL_WARDS = [
  'Ward 1 - Central Market',
  'Ward 2 - North Sector',
  'Ward 3 - South Hill',
  'Ward 4 - East Riverside',
  'Ward 5 - Industrial Park',
  'Ward 6 - West Suburb',
  'Ward 12 - Green Hills'
];

export default function TankForm({ initialData = {}, onSubmit, onCancel, isEdit = false }) {
  const [formData, setFormData] = useState({
    tank_number: initialData.tank_number || '',
    tank_name: initialData.tank_name || '',
    tank_type: initialData.tank_type || 'OVERHEAD_TANK',
    zone: initialData.zone || 'Zone 1 - Central',
    ward: initialData.ward || 'Ward 1 - Central Market',
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
        setPipelines(response.data?.items || []);
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
      alert("Please specify the Ward and Area.");
      return;
    }

    const capacity = parseFloat(formData.capacity_liters);
    if (isNaN(capacity) || capacity <= 0) {
      alert("Storage capacity must be a positive number.");
      return;
    }

    const currentLevel = formData.current_level_liters ? parseFloat(formData.current_level_liters) : 0;
    if (currentLevel < 0) {
      alert("Water level cannot be negative.");
      return;
    }

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
      delete payload.tank_number;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleFormSubmit} className="water-form-container">
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
          {isEdit ? `Edit Water Tank (${initialData.tank_number})` : 'Register Water Tank'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.3rem 0 0 0' }}>
          Enter municipal storage tank details, location, and capacity specifications.
        </p>
      </div>

      {/* 1. Identity & Location */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#2563eb', margin: 0 }}>
          1. Identity & Location
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label className="water-label">Tank Number (Auto-generated if blank)</label>
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
            <label className="water-label">Tank Name / Descriptor</label>
            <input 
              type="text" 
              name="tank_name"
              value={formData.tank_name}
              onChange={handleChange}
              placeholder="e.g. Green Hills Overhead Reservoir A"
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Tank Category / Type</label>
            <select 
              name="tank_type" 
              value={formData.tank_type} 
              onChange={handleChange}
              className="water-select"
            >
              {TANK_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="water-label">Municipal Ward *</label>
            <input 
              type="text" 
              name="ward"
              list="tank-ward-list"
              value={formData.ward}
              onChange={handleChange}
              placeholder="e.g. Ward 12 - Green Hills"
              required
              className="water-input"
            />
            <datalist id="tank-ward-list">
              {MUNICIPAL_WARDS.map(w => <option key={w} value={w} />)}
            </datalist>
          </div>

          <div>
            <label className="water-label">Area / Locality *</label>
            <input 
              type="text" 
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="e.g. Green Hills Sector 2"
              required
              className="water-input"
            />
          </div>
        </div>
      </div>

      {/* 2. Capacity & Source */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#2563eb', margin: 0 }}>
          2. Storage Capacity & Water Source
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label className="water-label">Total Storage Capacity (Liters) *</label>
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

          <div>
            <label className="water-label">Current Water Level (Liters)</label>
            <input 
              type="number" 
              name="current_level_liters"
              value={formData.current_level_liters}
              onChange={handleChange}
              placeholder="e.g. 35000"
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Primary Water Source</label>
            <input 
              type="text" 
              name="water_source"
              value={formData.water_source}
              onChange={handleChange}
              placeholder="e.g. River Intake Plant 1"
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Connected Main Pipeline (Optional)</label>
            <select 
              name="pipeline_id" 
              value={formData.pipeline_id} 
              onChange={handleChange}
              className="water-select"
            >
              <option value="">-- No Direct Pipeline Connection --</option>
              {pipelines.map(p => (
                <option key={p.id} value={p.id}>
                  {p.pipeline_number} - {p.pipeline_name || p.ward} ({p.pipeline_type})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Operational State & Notes */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#2563eb', margin: 0 }}>
          3. Operational Status & Cleaning Schedule
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label className="water-label">Operational Status</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
              className="water-select"
            >
              {STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

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
            <label className="water-label">Next Scheduled Cleaning</label>
            <input 
              type="date" 
              name="next_cleaning_date"
              value={formData.next_cleaning_date}
              onChange={handleChange}
              className="water-input"
            />
          </div>
        </div>

        <div>
          <label className="water-label">Remarks & Special Instructions</label>
          <textarea 
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Optional additional notes..."
            rows="2"
            className="water-input"
            style={{ resize: 'vertical' }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        justifyContent: 'flex-end',
        marginTop: '1.5rem',
        borderTop: '1px solid #e2e8f0',
        paddingTop: '1.25rem'
      }}>
        <button 
          type="button" 
          onClick={onCancel}
          style={{
            padding: '0.55rem 1.25rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#475569',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>

        <button 
          type="submit" 
          style={{
            padding: '0.55rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          {isEdit ? 'Save Changes' : 'Register Water Tank'}
        </button>
      </div>
    </form>
  );
}
