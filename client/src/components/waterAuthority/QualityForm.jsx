import React, { useState, useEffect } from 'react';
import { getPipelines } from '../../services/pipelineService';
import { getTanks } from '../../services/waterTankService';

const SAMPLE_TYPES = ['PIPELINE', 'OVERHEAD_TANK', 'UNDERGROUND_TANK', 'PUBLIC_TAP', 'RESERVOIR'];
const ODORS = ['NONE', 'MUSTY', 'CHLORINE', 'SULFUR', 'METALLIC', 'EARTHY'];
const TASTES = ['NORMAL', 'METALLIC', 'SALTY', 'BITTER', 'CHLORINE', 'FLAT'];
const COLORS = ['CLEAR', 'TURBID', 'YELLOWISH', 'BROWNISH', 'RUSTY'];

export default function QualityForm({ initialData = {}, onSubmit, onCancel, isEdit = false }) {
  const [formData, setFormData] = useState({
    report_number: initialData.report_number || '',
    zone: initialData.zone || '',
    ward: initialData.ward || '',
    area: initialData.area || '',
    pipeline_id: initialData.pipeline_id || '',
    tank_id: initialData.tank_id || '',
    sample_location: initialData.sample_location || '',
    sample_type: initialData.sample_type || 'PIPELINE',
    sample_date: initialData.sample_date || new Date().toISOString().substring(0, 10),
    tested_by: initialData.tested_by || '',
    laboratory_name: initialData.laboratory_name || '',
    ph_level: initialData.ph_level || '',
    tds: initialData.tds || '',
    turbidity: initialData.turbidity || '',
    chlorine_level: initialData.chlorine_level || '',
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
        setPipelines(pipeRes.data.items);

        const tankRes = await getTanks({ page: 1, page_size: 100 });
        setTanks(tankRes.data.items);
      } catch (err) {
        console.error("Could not load systems:", err);
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
      alert("Ward and Area are required.");
      return;
    }

    const ph = parseFloat(formData.ph_level);
    if (isNaN(ph) || ph < 0 || ph > 14) {
      alert("pH level must be between 0.0 and 14.0.");
      return;
    }

    const tdsVal = parseFloat(formData.tds);
    if (isNaN(tdsVal) || tdsVal < 0) {
      alert("TDS level must be a non-negative number.");
      return;
    }

    const turbVal = parseFloat(formData.turbidity);
    if (isNaN(turbVal) || turbVal < 0) {
      alert("Turbidity must be a non-negative number.");
      return;
    }

    const chlorVal = parseFloat(formData.chlorine_level);
    if (isNaN(chlorVal) || chlorVal < 0) {
      alert("Chlorine level must be a non-negative number.");
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
      tank_id: formData.tank_id ? parseInt(formData.tank_id) : null,
      sample_date: formData.sample_date || null
    };

    if (!payload.report_number.trim()) {
      delete payload.report_number; // auto-generated if empty
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleFormSubmit} className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.75rem', margin: 0 }}>
        {isEdit ? `Modify Report: ${initialData.report_number}` : 'Register Water Quality Lab Report'}
      </h3>

      {/* Metadata */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div>
          <label className="water-label">Report Number (Leave blank to auto-generate)</label>
          <input 
            type="text" 
            name="report_number"
            value={formData.report_number}
            onChange={handleChange}
            placeholder="e.g. WQR-990234"
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
            className="water-input"
          >
            {SAMPLE_TYPES.map(t => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Location */}
      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: '0.5rem 0 0 0', letterSpacing: '0.5px' }}>
        Sampling Location details
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
            placeholder="e.g. Zone A"
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
            placeholder="e.g. Ward 1"
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
            placeholder="e.g. Green Gardens"
            required
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
          <label className="water-label">Sample Point Location description</label>
          <input 
            type="text" 
            name="sample_location"
            value={formData.sample_location}
            onChange={handleChange}
            placeholder="e.g. Tap outside Community Center"
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">Connected Pipeline Feed</label>
          <select 
            name="pipeline_id" 
            value={formData.pipeline_id} 
            onChange={handleChange}
            className="water-input"
          >
            <option value="">None / Not linked to Pipeline</option>
            {pipelines.map(p => (
              <option key={p.id} value={p.id}>{p.pipeline_number} ({p.pipeline_name || 'Unnamed'})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="water-label">Connected Storage Tank</label>
          <select 
            name="tank_id" 
            value={formData.tank_id} 
            onChange={handleChange}
            className="water-input"
          >
            <option value="">None / Not linked to Storage Tank</option>
            {tanks.map(t => (
              <option key={t.id} value={t.id}>{t.tank_number} ({t.tank_name || 'Unnamed'})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lab details */}
      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: '0.5rem 0 0 0', letterSpacing: '0.5px' }}>
        Lab Analysis Details
      </h4>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div>
          <label className="water-label">Tested By / Inspector Name</label>
          <input 
            type="text" 
            name="tested_by"
            value={formData.tested_by}
            onChange={handleChange}
            placeholder="e.g. Dr. Sarah Jenkins"
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">Laboratory Name</label>
          <input 
            type="text" 
            name="laboratory_name"
            value={formData.laboratory_name}
            onChange={handleChange}
            placeholder="e.g. City Quality Testing Lab"
            className="water-input"
          />
        </div>
      </div>

      {/* Chemical parameters */}
      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: '0.5rem 0 0 0', letterSpacing: '0.5px' }}>
        Chemical Parameters (Standard Thresholds checked)
      </h4>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem'
      }}>
        <div>
          <label className="water-label">pH Level * (6.5 - 8.5)</label>
          <input 
            type="number" 
            step="0.01"
            name="ph_level"
            value={formData.ph_level}
            onChange={handleChange}
            placeholder="e.g. 7.2"
            required
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">TDS * (&lt; 500 mg/L)</label>
          <input 
            type="number" 
            step="0.1"
            name="tds"
            value={formData.tds}
            onChange={handleChange}
            placeholder="e.g. 180"
            required
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">Turbidity * (&lt; 1.0 NTU)</label>
          <input 
            type="number" 
            step="0.01"
            name="turbidity"
            value={formData.turbidity}
            onChange={handleChange}
            placeholder="e.g. 0.3"
            required
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">Chlorine Level * (0.2 - 2.0 mg/L)</label>
          <input 
            type="number" 
            step="0.01"
            name="chlorine_level"
            value={formData.chlorine_level}
            onChange={handleChange}
            placeholder="e.g. 1.2"
            required
            className="water-input"
          />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem'
      }}>
        <div>
          <label className="water-label">Fluoride (mg/L)</label>
          <input 
            type="number" 
            step="0.01"
            name="fluoride"
            value={formData.fluoride}
            onChange={handleChange}
            placeholder="e.g. 0.7"
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">Nitrate (mg/L)</label>
          <input 
            type="number" 
            step="0.1"
            name="nitrate"
            value={formData.nitrate}
            onChange={handleChange}
            placeholder="e.g. 12"
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">Hardness (mg/L)</label>
          <input 
            type="number" 
            step="0.1"
            name="hardness"
            value={formData.hardness}
            onChange={handleChange}
            placeholder="e.g. 150"
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">Iron (mg/L)</label>
          <input 
            type="number" 
            step="0.001"
            name="iron"
            value={formData.iron}
            onChange={handleChange}
            placeholder="e.g. 0.05"
            className="water-input"
          />
        </div>
      </div>

      {/* Biological & Physical details */}
      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: '0.5rem 0 0 0', letterSpacing: '0.5px' }}>
        Biological & Physical parameters
      </h4>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '1rem 0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', color: 'var(--water-text)' }}>
            <input 
              type="checkbox" 
              name="bacteria_present"
              checked={formData.bacteria_present}
              onChange={handleChange}
              style={{ width: '16px', height: '16px' }}
            />
            Bacteria Present (Coliform, etc.)
          </label>
        </div>

        <div>
          <label className="water-label">Temperature (°C)</label>
          <input 
            type="number" 
            step="0.1"
            name="temperature"
            value={formData.temperature}
            onChange={handleChange}
            placeholder="e.g. 18.5"
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">Odor description</label>
          <select 
            name="odor" 
            value={formData.odor} 
            onChange={handleChange}
            className="water-input"
          >
            {ODORS.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="water-label">Taste description</label>
          <select 
            name="taste" 
            value={formData.taste} 
            onChange={handleChange}
            className="water-input"
          >
            {TASTES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem'
      }}>
        <div>
          <label className="water-label">Color description</label>
          <select 
            name="color" 
            value={formData.color} 
            onChange={handleChange}
            className="water-input"
          >
            {COLORS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="water-label">Remarks & Comments</label>
          <input 
            type="text" 
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Comments, notes..."
            className="water-input"
          />
        </div>
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
          {isEdit ? 'Save Changes' : 'Register Report'}
        </button>
      </div>
    </form>
  );
}
