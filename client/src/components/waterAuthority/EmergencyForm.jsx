import React, { useState } from 'react';

const PRIORITIES = [
  { value: 'LOW', label: 'Low Priority' },
  { value: 'MEDIUM', label: 'Medium Priority' },
  { value: 'HIGH', label: 'High Priority' },
  { value: 'CRITICAL', label: 'Critical / Emergency Action' }
];

const STATUSES = [
  { value: 'DECLARED', label: 'Declared (Water Supply Isolated)' },
  { value: 'UNDER_REPAIR', label: 'Under Repair (Crew On-Site)' },
  { value: 'RESTORED', label: 'Restored (Water Supply Restored)' },
  { value: 'CLOSED', label: 'Closed & Documented' }
];

const TYPES = [
  { value: 'PIPELINE_BURST', label: 'Main Pipeline Burst (Water Loss / Flooding)' },
  { value: 'MAJOR_LEAK', label: 'Major Joint Leakage' },
  { value: 'CONTAMINATION', label: 'Water Contamination Alert' },
  { value: 'PUMP_FAILURE', label: 'Central Pumping Station Failure' },
  { value: 'POWER_FAILURE', label: 'Power Grid Outage' },
  { value: 'VALVE_FAILURE', label: 'Main Isolation Valve Failure' }
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

export default function EmergencyForm({ initialData = {}, onSubmit, onCancel, isEdit = false }) {
  const [formData, setFormData] = useState({
    shutdown_number: initialData.shutdown_number || '',
    title: initialData.title || '',
    description: initialData.description || '',
    emergency_type: initialData.emergency_type || 'PIPELINE_BURST',
    priority: initialData.priority || 'CRITICAL',
    status: initialData.status || 'DECLARED',
    zone: initialData.zone || 'Zone 1 - Central',
    ward: initialData.ward || 'Ward 1 - Central Market',
    area: initialData.area || '',
    affected_pipeline_id: initialData.affected_pipeline_id || '',
    affected_tank_id: initialData.affected_tank_id || '',
    affected_schedule_id: initialData.affected_schedule_id || '',
    reason: initialData.reason || '',
    shutdown_start: initialData.shutdown_start ? new Date(initialData.shutdown_start).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    expected_restore_time: initialData.expected_restore_time ? new Date(initialData.expected_restore_time).toISOString().slice(0, 16) : '',
    assigned_supervisor: initialData.assigned_supervisor || '',
    assigned_team: initialData.assigned_team || 'Municipal Disaster Response Crew 1',
    remarks: initialData.remarks || '',
    actual_restore_time: initialData.actual_restore_time ? new Date(initialData.actual_restore_time).toISOString().slice(0, 16) : '',
    citizen_notification_sent: initialData.citizen_notification_sent || true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.ward.trim() || !formData.area.trim()) {
      alert("Incident Title, Ward, and Area are required.");
      return;
    }

    const payload = {
      ...formData,
      affected_pipeline_id: formData.affected_pipeline_id ? parseInt(formData.affected_pipeline_id) : null,
      affected_tank_id: formData.affected_tank_id ? parseInt(formData.affected_tank_id) : null,
      affected_schedule_id: formData.affected_schedule_id ? parseInt(formData.affected_schedule_id) : null,
      shutdown_start: new Date(formData.shutdown_start).toISOString(),
      expected_restore_time: formData.expected_restore_time ? new Date(formData.expected_restore_time).toISOString() : null,
      actual_restore_time: formData.actual_restore_time ? new Date(formData.actual_restore_time).toISOString() : null
    };

    if (!payload.shutdown_number.trim()) {
      delete payload.shutdown_number;
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
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#dc2626', margin: 0 }}>
          {isEdit ? `Edit Emergency Shutdown (${initialData.shutdown_number})` : 'Declare Emergency Water Shutdown'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.3rem 0 0 0' }}>
          Stop water flow to isolate main line pipe bursts or contamination, and broadcast alerts to affected citizens.
        </p>
      </div>

      {/* 1. Incident Title & Location */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#dc2626', margin: 0 }}>
          1. Incident Details & Affected Ward
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="water-label">Incident Title *</label>
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Ward 12 Main Trunk Pipeline Burst Emergency Isolation"
              required
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Shutdown Number (Auto-generated if blank)</label>
            <input 
              type="text" 
              name="shutdown_number"
              value={formData.shutdown_number}
              onChange={handleChange}
              placeholder="e.g. ESD-900412"
              disabled={isEdit}
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Emergency Category</label>
            <select 
              name="emergency_type" 
              value={formData.emergency_type} 
              onChange={handleChange}
              className="water-select"
            >
              {TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="water-label">Priority</label>
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
              list="emerg-form-ward-list"
              value={formData.ward}
              onChange={handleChange}
              placeholder="e.g. Ward 12 - Green Hills"
              required
              className="water-input"
            />
            <datalist id="emerg-form-ward-list">
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
        </div>
      </div>

      {/* 2. Schedule & Crew */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#2563eb', margin: 0 }}>
          2. Shutdown Timetable & Rapid Response Crew
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label className="water-label">Shutdown Start Time *</label>
            <input 
              type="datetime-local" 
              name="shutdown_start"
              value={formData.shutdown_start}
              onChange={handleChange}
              required
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Target Restoration Time</label>
            <input 
              type="datetime-local" 
              name="expected_restore_time"
              value={formData.expected_restore_time}
              onChange={handleChange}
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Assigned Disaster Response Crew</label>
            <input 
              type="text" 
              name="assigned_team"
              value={formData.assigned_team}
              onChange={handleChange}
              placeholder="e.g. Municipal Rapid Response Unit 1"
              className="water-input"
            />
          </div>
        </div>
      </div>

      {/* 3. Reason & Instructions */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#2563eb', margin: 0 }}>
          3. Diagnosis, Status & Instructions
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label className="water-label">Status</label>
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
          <label className="water-label">Root Cause / Failure Reason</label>
          <textarea 
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="State the technical failure reason (e.g. 500mm Cast Iron pipe burst at joint #14 due to pressure surge)..."
            rows="2"
            className="water-input"
            style={{ resize: 'vertical' }}
          />
        </div>

        <div>
          <label className="water-label">Emergency Directives & Advisory</label>
          <textarea 
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Special advisory notes for citizens and field engineers..."
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
            backgroundColor: '#dc2626',
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          {isEdit ? 'Save Changes' : 'Declare Emergency Shutdown'}
        </button>
      </div>
    </form>
  );
}
