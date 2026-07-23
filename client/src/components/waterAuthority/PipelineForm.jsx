import React, { useState } from 'react';

const PIPELINE_TYPES = ['MAIN_LINE', 'SUB_LINE', 'SERVICE_LINE', 'DISTRIBUTION_LINE'];
const MATERIALS = ['PVC', 'HDPE', 'DI', 'STEEL', 'CI', 'OTHER'];
const CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'];
const STATUSES = ['ACTIVE', 'UNDER_MAINTENANCE', 'DAMAGED', 'OUT_OF_SERVICE', 'REPLACED'];

export default function PipelineForm({ initialData = {}, onSubmit, onCancel, isEdit = false }) {
  const [formData, setFormData] = useState({
    pipeline_number: initialData.pipeline_number || '',
    pipeline_name: initialData.pipeline_name || '',
    zone: initialData.zone || '',
    ward: initialData.ward || '',
    area: initialData.area || '',
    street: initialData.street || '',
    pipeline_type: initialData.pipeline_type || 'DISTRIBUTION_LINE',
    diameter: initialData.diameter || '',
    length: initialData.length || '',
    material: initialData.material || 'PVC',
    installation_date: initialData.installation_date || '',
    expected_life: initialData.expected_life || '',
    water_source: initialData.water_source || '',
    start_location: initialData.start_location || '',
    end_location: initialData.end_location || '',
    latitude: initialData.latitude || '',
    longitude: initialData.longitude || '',
    pressure_level: initialData.pressure_level || '',
    condition: initialData.condition || 'EXCELLENT',
    current_status: initialData.current_status || 'ACTIVE',
    remarks: initialData.remarks || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Validations
    if (!formData.ward.trim() || !formData.area.trim()) {
      alert("Ward and Area are required.");
      return;
    }

    // Prepare payload (convert strings to float/int if present)
    const payload = {
      ...formData,
      diameter: formData.diameter ? parseFloat(formData.diameter) : null,
      length: formData.length ? parseFloat(formData.length) : null,
      expected_life: formData.expected_life ? parseInt(formData.expected_life) : null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      pressure_level: formData.pressure_level ? parseFloat(formData.pressure_level) : null
    };

    if (!payload.pipeline_number.trim()) {
      delete payload.pipeline_number; // database generates unique WPL-XXXXXX if null/empty
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleFormSubmit} className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.75rem', margin: 0 }}>
        {isEdit ? `Edit Pipeline: ${initialData.pipeline_number}` : 'Register New Pipeline'}
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        {/* Basic Details */}
        <div>
          <label className="water-label">Pipeline Number (Leave blank to auto-generate)</label>
          <input 
            type="text" 
            name="pipeline_number"
            value={formData.pipeline_number}
            onChange={handleChange}
            placeholder="e.g. WPL-100244"
            disabled={isEdit}
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
            placeholder="e.g. Trunk Line North A"
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">Water Source</label>
          <input 
            type="text" 
            name="water_source"
            value={formData.water_source}
            onChange={handleChange}
            placeholder="e.g. Reservoir B"
            className="water-input"
          />
        </div>
      </div>

      {/* Location Details */}
      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: '0.5rem 0 0 0', letterSpacing: '0.5px' }}>
        Location Details
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
            placeholder="e.g. Zone 4"
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
            placeholder="e.g. Ward 12"
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
            placeholder="e.g. Green Hills"
            required
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">Street</label>
          <input 
            type="text" 
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="e.g. Maple Avenue"
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
          <label className="water-label">Start Location</label>
          <input 
            type="text" 
            name="start_location"
            value={formData.start_location}
            onChange={handleChange}
            placeholder="e.g. Tank 4 Outlet Valve"
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">End Location</label>
          <input 
            type="text" 
            name="end_location"
            value={formData.end_location}
            onChange={handleChange}
            placeholder="e.g. Ward 12 Junction"
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

      {/* Technical Specifications */}
      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: '0.5rem 0 0 0', letterSpacing: '0.5px' }}>
        Technical Specifications
      </h4>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div>
          <label className="water-label">Pipeline Type</label>
          <select 
            name="pipeline_type" 
            value={formData.pipeline_type} 
            onChange={handleChange}
            className="water-input"
          >
            {PIPELINE_TYPES.map(t => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
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
          <label className="water-label">Length (meters)</label>
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

        <div>
          <label className="water-label">Material</label>
          <select 
            name="material" 
            value={formData.material} 
            onChange={handleChange}
            className="water-input"
          >
            {MATERIALS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
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

        <div>
          <label className="water-label">Expected Life (years)</label>
          <input 
            type="number" 
            name="expected_life"
            value={formData.expected_life}
            onChange={handleChange}
            placeholder="e.g. 25"
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">Current Pressure Level (psi / bar)</label>
          <input 
            type="number" 
            step="0.1"
            name="pressure_level"
            value={formData.pressure_level}
            onChange={handleChange}
            placeholder="e.g. 4.5"
            className="water-input"
          />
        </div>
      </div>

      {/* Conditions & Remarks */}
      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: '0.5rem 0 0 0', letterSpacing: '0.5px' }}>
        Current State & Condition
      </h4>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem'
      }}>
        <div>
          <label className="water-label">Condition Status</label>
          <select 
            name="condition" 
            value={formData.condition} 
            onChange={handleChange}
            className="water-input"
          >
            {CONDITIONS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="water-label">Operational Status</label>
          <select 
            name="current_status" 
            value={formData.current_status} 
            onChange={handleChange}
            className="water-input"
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="water-label">Remarks & Instructions</label>
        <textarea 
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          placeholder="Enter additional remarks..."
          rows="3"
          className="water-input"
          style={{ resize: 'vertical' }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
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
          {isEdit ? 'Save Changes' : 'Register Pipeline'}
        </button>
      </div>
    </form>
  );
}
