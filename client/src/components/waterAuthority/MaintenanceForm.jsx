import React, { useState } from 'react';

const PRIORITIES = [
  { value: 'LOW', label: 'Low Priority' },
  { value: 'MEDIUM', label: 'Medium Priority' },
  { value: 'HIGH', label: 'High Priority' },
  { value: 'CRITICAL', label: 'Critical / Urgent' }
];

const STATUSES = [
  { value: 'PENDING', label: 'Pending (Reported)' },
  { value: 'SCHEDULED', label: 'Scheduled (Crew Dispatched)' },
  { value: 'IN_PROGRESS', label: 'In Progress (Active Repair)' },
  { value: 'COMPLETED', label: 'Completed' }
];

const TYPES = [
  { value: 'PIPELINE_REPAIR', label: 'Pipeline Leak / Burst Repair' },
  { value: 'TANK_CLEANING', label: 'Overhead Tank Cleaning & Sanitization' },
  { value: 'TANK_REPAIR', label: 'Storage Tank Repair' },
  { value: 'VALVE_REPLACEMENT', label: 'Pressure Control Valve Replacement' },
  { value: 'PUMP_REPAIR', label: 'Pump Station Repair' },
  { value: 'LEAK_REPAIR', label: 'Service Connection Leak Repair' },
  { value: 'GENERAL_MAINTENANCE', label: 'General Infrastructure Maintenance' }
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

export default function MaintenanceForm({ initialData = {}, onSubmit, onCancel, isEdit = false }) {
  const [formData, setFormData] = useState({
    maintenance_number: initialData.maintenance_number || '',
    maintenance_type: initialData.maintenance_type || 'PIPELINE_REPAIR',
    source_type: initialData.source_type || 'MANUAL',
    source_reference_id: initialData.source_reference_id || '',
    title: initialData.title || '',
    description: initialData.description || '',
    zone: initialData.zone || 'Zone 1 - Central',
    ward: initialData.ward || 'Ward 1 - Central Market',
    area: initialData.area || '',
    priority: initialData.priority || 'MEDIUM',
    status: initialData.status || 'PENDING',
    scheduled_date: initialData.scheduled_date || new Date().toISOString().substring(0, 10),
    start_date: initialData.start_date || '',
    expected_completion: initialData.expected_completion || '',
    completed_date: initialData.completed_date || '',
    assigned_supervisor: initialData.assigned_supervisor || '',
    assigned_team: initialData.assigned_team || 'Municipal Rapid Repair Crew 1',
    estimated_cost: initialData.estimated_cost || '',
    actual_cost: initialData.actual_cost || '',
    remarks: initialData.remarks || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.ward.trim() || !formData.area.trim()) {
      alert("Job Title, Ward, and Area are required.");
      return;
    }

    const payload = {
      ...formData,
      source_reference_id: formData.source_reference_id ? parseInt(formData.source_reference_id) : null,
      estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : 0.0,
      actual_cost: formData.actual_cost ? parseFloat(formData.actual_cost) : 0.0,
      scheduled_date: formData.scheduled_date || null,
      start_date: formData.start_date || null,
      expected_completion: formData.expected_completion || null,
      completed_date: formData.completed_date || null
    };

    if (!payload.maintenance_number.trim()) {
      delete payload.maintenance_number;
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
          {isEdit ? `Edit Job (${initialData.maintenance_number})` : 'Log Maintenance Request'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.3rem 0 0 0' }}>
          Schedule pipeline repairs, tank cleaning, or valve replacements and dispatch repair crews.
        </p>
      </div>

      {/* 1. Request Title & Location */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#2563eb', margin: 0 }}>
          1. Job Title & Area Location
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="water-label">Maintenance Request Title *</label>
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Ward 12 Main Distribution Line Joint Leak Repair"
              required
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Maintenance Number (Auto-generated if blank)</label>
            <input 
              type="text" 
              name="maintenance_number"
              value={formData.maintenance_number}
              onChange={handleChange}
              placeholder="e.g. WMN-100249"
              disabled={isEdit}
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Maintenance Category</label>
            <select 
              name="maintenance_type" 
              value={formData.maintenance_type} 
              onChange={handleChange}
              className="water-select"
            >
              {TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="water-label">Work Priority</label>
            <select 
              name="priority" 
              value={formData.priority} 
              onChange={handleChange}
              className="water-select"
            >
              {PRIORITIES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="water-label">Municipal Ward *</label>
            <input 
              type="text" 
              name="ward"
              list="maint-form-ward-list"
              value={formData.ward}
              onChange={handleChange}
              placeholder="e.g. Ward 12 - Green Hills"
              required
              className="water-input"
            />
            <datalist id="maint-form-ward-list">
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
        </div>
      </div>

      {/* 2. Schedule & Crew */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#2563eb', margin: 0 }}>
          2. Schedule & Assigned Maintenance Crew
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label className="water-label">Scheduled Start Date</label>
            <input 
              type="date" 
              name="scheduled_date"
              value={formData.scheduled_date}
              onChange={handleChange}
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Expected Completion Date</label>
            <input 
              type="date" 
              name="expected_completion"
              value={formData.expected_completion}
              onChange={handleChange}
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Assigned Maintenance Crew</label>
            <input 
              type="text" 
              name="assigned_team"
              value={formData.assigned_team}
              onChange={handleChange}
              placeholder="e.g. Municipal Rapid Pipeline Repair Unit 1"
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Estimated Repair Cost (₹)</label>
            <input 
              type="number" 
              step="0.01"
              name="estimated_cost"
              value={formData.estimated_cost}
              onChange={handleChange}
              placeholder="e.g. 15000"
              className="water-input"
            />
          </div>
        </div>
      </div>

      {/* 3. Description & Status */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#2563eb', margin: 0 }}>
          3. Work Description & Status
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label className="water-label">Job Status</label>
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
        </div>

        <div>
          <label className="water-label">Work Scope & Instructions</label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the defect, required spare parts (valves/gaskets), and repair procedure..."
            rows="3"
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
          {isEdit ? 'Save Changes' : 'Log Maintenance Request'}
        </button>
      </div>
    </form>
  );
}
