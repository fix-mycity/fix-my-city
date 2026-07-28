import React, { useState, useEffect } from 'react';
import { getTanks } from '../../services/waterTankService';

const PIPELINE_TYPES = [
  { value: 'MAIN_LINE', label: 'Main Trunk Line' },
  { value: 'SUB_LINE', label: 'Sub-Trunk Line' },
  { value: 'DISTRIBUTION_LINE', label: 'Distribution Line' },
  { value: 'SERVICE_LINE', label: 'Service Line' }
];

const MATERIALS = [
  { value: 'HDPE', label: 'HDPE (Polyethylene)' },
  { value: 'DI', label: 'Ductile Iron (DI)' },
  { value: 'PVC', label: 'PVC' },
  { value: 'STEEL', label: 'Steel' },
  { value: 'CI', label: 'Cast Iron' },
  { value: 'OTHER', label: 'Other' }
];

const CONDITIONS = [
  { value: 'EXCELLENT', label: 'Excellent' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
  { value: 'CRITICAL', label: 'Critical' }
];

const STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'UNDER_MAINTENANCE', label: 'Under Maintenance' },
  { value: 'DAMAGED', label: 'Damaged' },
  { value: 'OUT_OF_SERVICE', label: 'Out of Service' }
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

export default function PipelineForm({ initialData = {}, onSubmit, onCancel, isEdit = false }) {
  const [tanks, setTanks] = useState([]);
  const [formData, setFormData] = useState({
    pipeline_number: initialData.pipeline_number || '',
    pipeline_name: initialData.pipeline_name || '',
    zone: initialData.zone || 'Zone 1 - Central',
    ward: initialData.ward || 'Ward 1 - Central Market',
    area: initialData.area || '',
    street: initialData.street || '',
    pipeline_type: initialData.pipeline_type || 'DISTRIBUTION_LINE',
    diameter: initialData.diameter || '',
    length: initialData.length || '',
    material: initialData.material || 'HDPE',
    installation_date: initialData.installation_date || new Date().toISOString().split('T')[0],
    expected_life: initialData.expected_life || 25,
    water_source: initialData.water_source || '',
    tank_id: initialData.tank_id || '',
    start_location: initialData.start_location || '',
    end_location: initialData.end_location || '',
    latitude: initialData.latitude || '',
    longitude: initialData.longitude || '',
    pressure_level: initialData.pressure_level || '',
    condition: initialData.condition || 'EXCELLENT',
    current_status: initialData.current_status || 'ACTIVE',
    remarks: initialData.remarks || ''
  });

  useEffect(() => {
    fetchTanksList();
  }, []);

  const fetchTanksList = async () => {
    try {
      const res = await getTanks({ page_size: 100 });
      setTanks(res.data?.items || res.data || []);
    } catch (_err) {
      setTanks([]);
    }
  };

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
      alert("Please specify the Ward and Area / Locality.");
      return;
    }

    const payload = {
      ...formData,
      diameter: formData.diameter ? parseFloat(formData.diameter) : null,
      length: formData.length ? parseFloat(formData.length) : null,
      expected_life: formData.expected_life ? parseInt(formData.expected_life) : null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      pressure_level: formData.pressure_level ? parseFloat(formData.pressure_level) : null,
      tank_id: formData.tank_id ? parseInt(formData.tank_id) : null
    };

    if (!payload.pipeline_number.trim()) {
      delete payload.pipeline_number;
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
          {isEdit ? `Edit Pipeline (${initialData.pipeline_number})` : 'Register Pipeline'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.3rem 0 0 0' }}>
          Fill in the details below to register a water pipeline network.
        </p>
      </div>

      {/* 1. Location & Identity */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#2563eb', margin: 0 }}>
          1. Location & Classification
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label className="water-label">Municipal Ward *</label>
            <input 
              type="text" 
              name="ward"
              list="ward-list"
              value={formData.ward}
              onChange={handleChange}
              placeholder="e.g. Ward 12 - Green Hills"
              required
              className="water-input"
            />
            <datalist id="ward-list">
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
              placeholder="e.g. Green Hills Colony"
              required
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Pipeline Name / Descriptor</label>
            <input 
              type="text" 
              name="pipeline_name"
              value={formData.pipeline_name}
              onChange={handleChange}
              placeholder="e.g. Main Distribution Feeder 1"
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Pipeline Type</label>
            <select 
              name="pipeline_type" 
              value={formData.pipeline_type} 
              onChange={handleChange}
              className="water-select"
            >
              {PIPELINE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Water Source & Specs */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#2563eb', margin: 0 }}>
          2. Source & Specs
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label className="water-label">Water Source</label>
            <input 
              type="text" 
              name="water_source"
              value={formData.water_source}
              onChange={handleChange}
              placeholder="e.g. Central Reservoir B"
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Connected Storage Tank</label>
            <select 
              name="tank_id" 
              value={formData.tank_id} 
              onChange={handleChange}
              className="water-select"
            >
              <option value="">-- Optional Storage Tank Connection --</option>
              {tanks.map(t => (
                <option key={t.id} value={t.id}>
                  {t.tank_number} ({t.ward || t.tank_type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="water-label">Pipe Material</label>
            <select 
              name="material" 
              value={formData.material} 
              onChange={handleChange}
              className="water-select"
            >
              {MATERIALS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="water-label">Diameter (mm)</label>
            <input 
              type="number" 
              name="diameter"
              value={formData.diameter}
              onChange={handleChange}
              placeholder="e.g. 150"
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Total Length (meters)</label>
            <input 
              type="number" 
              step="0.1"
              name="length"
              value={formData.length}
              onChange={handleChange}
              placeholder="e.g. 750"
              className="water-input"
            />
          </div>
        </div>
      </div>

      {/* 3. Status & Remarks */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#2563eb', margin: 0 }}>
          3. Status & Remarks
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label className="water-label">Operational Status</label>
            <select 
              name="current_status" 
              value={formData.current_status} 
              onChange={handleChange}
              className="water-select"
            >
              {STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="water-label">Physical Condition</label>
            <select 
              name="condition" 
              value={formData.condition} 
              onChange={handleChange}
              className="water-select"
            >
              {CONDITIONS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="water-label">Remarks & Notes</label>
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
          {isEdit ? 'Save Changes' : 'Register Pipeline'}
        </button>
      </div>
    </form>
  );
}
