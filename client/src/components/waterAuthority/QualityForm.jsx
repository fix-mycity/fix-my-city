import React, { useState, useEffect } from 'react';
import { getPipelines } from '../../services/pipelineService';
import { getTanks } from '../../services/waterTankService';

const SAMPLE_TYPES = [
  { value: 'PIPELINE', label: 'Main Pipeline Network' },
  { value: 'OVERHEAD_TANK', label: 'Overhead Tank Reservoir' },
  { value: 'UNDERGROUND_TANK', label: 'Underground Sump' },
  { value: 'PUBLIC_TAP', label: 'Public Tap Standpost' },
  { value: 'RESERVOIR', label: 'Central Reservoir Intake' }
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

export default function QualityForm({ initialData = {}, onSubmit, onCancel, isEdit = false }) {
  const [formData, setFormData] = useState({
    report_number: initialData.report_number || '',
    zone: initialData.zone || 'Zone 1 - Central',
    ward: initialData.ward || 'Ward 1 - Central Market',
    area: initialData.area || '',
    pipeline_id: initialData.pipeline_id || '',
    tank_id: initialData.tank_id || '',
    sample_location: initialData.sample_location || '',
    sample_type: initialData.sample_type || 'PIPELINE',
    sample_date: initialData.sample_date || new Date().toISOString().substring(0, 10),
    tested_by: initialData.tested_by || '',
    laboratory_name: initialData.laboratory_name || 'Central Municipal Testing Lab',
    ph_level: initialData.ph_level || '7.2',
    tds: initialData.tds || '250',
    turbidity: initialData.turbidity || '0.5',
    chlorine_level: initialData.chlorine_level || '0.5',
    hardness: initialData.hardness || '',
    iron: initialData.iron || '',
    fluoride: initialData.fluoride || '',
    nitrate: initialData.nitrate || '',
    bacteria_present: initialData.bacteria_present || false,
    temperature: initialData.temperature || '',
    odor: initialData.odor || 'NONE',
    color: initialData.color || 'CLEAR',
    taste: initialData.taste || 'NORMAL',
    remarks: initialData.remarks || ''
  });

  const [pipelines, setPipelines] = useState([]);
  const [tanks, setTanks] = useState([]);

  useEffect(() => {
    const fetchSystemsData = async () => {
      try {
        const pipeRes = await getPipelines({ page: 1, page_size: 100 });
        setPipelines(pipeRes.data?.items || []);

        const tankRes = await getTanks({ page: 1, page_size: 100 });
        setTanks(tankRes.data?.items || []);
      } catch (err) {
        console.error("Could not load systems for quality form:", err);
      }
    };
    fetchSystemsData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!formData.ward.trim() || !formData.area.trim()) {
      alert("Please specify the Ward and Area / Locality.");
      return;
    }

    const ph = parseFloat(formData.ph_level);
    if (isNaN(ph) || ph < 0 || ph > 14) {
      alert("pH level must be between 0.0 and 14.0.");
      return;
    }

    const tdsVal = parseFloat(formData.tds);
    if (isNaN(tdsVal) || tdsVal < 0) {
      alert("TDS level must be a positive number.");
      return;
    }

    const turbVal = parseFloat(formData.turbidity);
    if (isNaN(turbVal) || turbVal < 0) {
      alert("Turbidity must be a positive number.");
      return;
    }

    const chlorVal = parseFloat(formData.chlorine_level);
    if (isNaN(chlorVal) || chlorVal < 0) {
      alert("Chlorine level must be a positive number.");
      return;
    }

    const payload = {
      ...formData,
      ph_level: ph,
      tds: tdsVal,
      turbidity: turbVal,
      chlorine_level: chlorVal,
      hardness: formData.hardness ? parseFloat(formData.hardness) : null,
      iron: formData.iron ? parseFloat(formData.iron) : null,
      fluoride: formData.fluoride ? parseFloat(formData.fluoride) : null,
      nitrate: formData.nitrate ? parseFloat(formData.nitrate) : null,
      temperature: formData.temperature ? parseFloat(formData.temperature) : null,
      pipeline_id: formData.pipeline_id ? parseInt(formData.pipeline_id) : null,
      tank_id: formData.tank_id ? parseInt(formData.tank_id) : null
    };

    if (!payload.report_number.trim()) {
      delete payload.report_number;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleFormSubmit} className="water-form-container" style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
          {isEdit ? `Edit Quality Report (${initialData.report_number})` : 'Register Water Quality Lab Report'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.3rem 0 0 0' }}>
          Record laboratory chemical analysis, physical parameters, and safety classifications for drinking water.
        </p>
      </div>

      {/* 1. Location & Sampling */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#2563eb', margin: 0 }}>
          1. Location & Sample Metadata
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label className="water-label">Report Number (Auto-generated if blank)</label>
            <input 
              type="text" 
              name="report_number"
              value={formData.report_number}
              onChange={handleChange}
              placeholder="e.g. WQR-100429"
              disabled={isEdit}
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Sample Date *</label>
            <input 
              type="date" 
              name="sample_date"
              value={formData.sample_date}
              onChange={handleChange}
              required
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Sample Type</label>
            <select 
              name="sample_type" 
              value={formData.sample_type} 
              onChange={handleChange}
              className="water-select"
            >
              {SAMPLE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="water-label">Municipal Ward *</label>
            <input 
              type="text" 
              name="ward"
              list="quality-ward-list"
              value={formData.ward}
              onChange={handleChange}
              placeholder="e.g. Ward 12 - Green Hills"
              required
              className="water-input"
            />
            <datalist id="quality-ward-list">
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
              placeholder="e.g. Green Hills Sector 4"
              required
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Testing Laboratory Name</label>
            <input 
              type="text" 
              name="laboratory_name"
              value={formData.laboratory_name}
              onChange={handleChange}
              placeholder="e.g. Municipal Public Health Water Lab"
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Tested By (Chemist / Inspector)</label>
            <input 
              type="text" 
              name="tested_by"
              value={formData.tested_by}
              onChange={handleChange}
              placeholder="e.g. Dr. A. Sharma (Chief Chemist)"
              className="water-input"
            />
          </div>
        </div>
      </div>

      {/* 2. Chemical & Physical Test Parameters */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#2563eb', margin: 0 }}>
          2. Physical & Chemical Test Parameters
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label className="water-label">pH Level (Ideal: 6.5 – 8.5) *</label>
            <input 
              type="number" 
              step="0.1"
              name="ph_level"
              value={formData.ph_level}
              onChange={handleChange}
              placeholder="e.g. 7.2"
              required
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Turbidity (NTU, Ideal: &lt; 1.0) *</label>
            <input 
              type="number" 
              step="0.1"
              name="turbidity"
              value={formData.turbidity}
              onChange={handleChange}
              placeholder="e.g. 0.4"
              required
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">TDS (mg/L, Ideal: 50 – 500) *</label>
            <input 
              type="number" 
              step="1"
              name="tds"
              value={formData.tds}
              onChange={handleChange}
              placeholder="e.g. 250"
              required
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Residual Chlorine (mg/L) *</label>
            <input 
              type="number" 
              step="0.1"
              name="chlorine_level"
              value={formData.chlorine_level}
              onChange={handleChange}
              placeholder="e.g. 0.5"
              required
              className="water-input"
            />
          </div>
        </div>

        {/* Biological Checkbox */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <input 
            type="checkbox" 
            id="bacteria_check"
            name="bacteria_present"
            checked={formData.bacteria_present}
            onChange={handleChange}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="bacteria_check" style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', cursor: 'pointer' }}>
            Flag Harmful Bacteria / Coliform Detected (Triggers UNSAFE status alert)
          </label>
        </div>
      </div>

      {/* 3. Remarks */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
        <label className="water-label">Chemist Remarks & Chlorination Directives</label>
        <textarea 
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          placeholder="Enter water safety conclusions or treatment instructions..."
          rows="3"
          className="water-input"
          style={{ resize: 'vertical' }}
        />
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
          {isEdit ? 'Save Changes' : 'Register Lab Report'}
        </button>
      </div>
    </form>
  );
}
