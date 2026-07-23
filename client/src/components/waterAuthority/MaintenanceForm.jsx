import React, { useState } from 'react';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['PENDING', 'SCHEDULED', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'VERIFIED', 'CANCELLED'];
const TYPES = ['PIPELINE_REPAIR', 'TANK_CLEANING', 'TANK_REPAIR', 'VALVE_REPLACEMENT', 'PUMP_REPAIR', 'LEAK_REPAIR', 'QUALITY_INSPECTION', 'EMERGENCY_REPAIR', 'GENERAL_MAINTENANCE'];
const SOURCES = ['COMPLAINT', 'PIPELINE', 'TANK', 'QUALITY', 'EMERGENCY', 'MANUAL'];

export default function MaintenanceForm({ initialData = {}, onSubmit, onCancel, isEdit = false }) {
  const [formData, setFormData] = useState({
    maintenance_number: initialData.maintenance_number || '',
    maintenance_type: initialData.maintenance_type || 'GENERAL_MAINTENANCE',
    source_type: initialData.source_type || 'MANUAL',
    source_reference_id: initialData.source_reference_id || '',
    title: initialData.title || '',
    description: initialData.description || '',
    zone: initialData.zone || '',
    ward: initialData.ward || '',
    area: initialData.area || '',
    priority: initialData.priority || 'MEDIUM',
    status: initialData.status || 'PENDING',
    scheduled_date: initialData.scheduled_date || '',
    start_date: initialData.start_date || '',
    expected_completion: initialData.expected_completion || '',
    completed_date: initialData.completed_date || '',
    assigned_supervisor: initialData.assigned_supervisor || '',
    assigned_team: initialData.assigned_team || '',
    estimated_cost: initialData.estimated_cost || 0,
    actual_cost: initialData.actual_cost || 0,
    remarks: initialData.remarks || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!formData.ward.trim() || !formData.area.trim() || !formData.title.trim()) {
      alert("Title, Ward, and Area are required.");
      return;
    }

    const payload = {
      ...formData,
      source_reference_id: formData.source_reference_id ? parseInt(formData.source_reference_id) : null,
      estimated_cost: parseFloat(formData.estimated_cost) || 0.0,
      actual_cost: parseFloat(formData.actual_cost) || 0.0,
      scheduled_date: formData.scheduled_date || null,
      start_date: formData.start_date || null,
      expected_completion: formData.expected_completion || null,
      completed_date: formData.completed_date || null
    };

    if (!payload.maintenance_number.trim()) {
      delete payload.maintenance_number; // auto-generated if empty
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleFormSubmit} className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.75rem', margin: 0 }}>
        {isEdit ? `Edit Job: ${initialData.maintenance_number}` : 'Schedule Maintenance Request'}
      </h3>

      {/* Main Parameters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div>
          <label className="water-label">Maintenance No. (Optional)</label>
          <input 
            type="text" 
            name="maintenance_number"
            value={formData.maintenance_number}
            onChange={handleChange}
            placeholder="e.g. WMN-990234"
            disabled={isEdit}
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">Maintenance Type *</label>
          <select 
            name="maintenance_type" 
            value={formData.maintenance_type} 
            onChange={handleChange}
            className="water-input"
          >
            {TYPES.map(t => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="water-label">Priority</label>
          <select 
            name="priority" 
            value={formData.priority} 
            onChange={handleChange}
            className="water-input"
          >
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div>
          <label className="water-label">Source Type *</label>
          <select 
            name="source_type" 
            value={formData.source_type} 
            onChange={handleChange}
            className="water-input"
          >
            {SOURCES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="water-label">Source Reference ID (Optional)</label>
          <input 
            type="number" 
            name="source_reference_id"
            value={formData.source_reference_id}
            onChange={handleChange}
            placeholder="e.g. 102"
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">Status</label>
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
      </div>

      {/* Details */}
      <div>
        <label className="water-label">Job Title / Summary *</label>
        <input 
          type="text" 
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Repair leak on main 12-inch HDPE conduit feed"
          required
          className="water-input"
        />
      </div>

      <div>
        <label className="water-label">Detailed Description</label>
        <textarea 
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe repairs scope..."
          className="water-input"
          style={{ height: '80px', fontFamily: 'inherit' }}
        />
      </div>

      {/* Location */}
      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: '0.5rem 0 0 0', letterSpacing: '0.5px' }}>
        Location details
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div>
          <label className="water-label">Zone</label>
          <input 
            type="text" 
            name="zone"
            value={formData.zone}
            onChange={handleChange}
            placeholder="e.g. West Zone"
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
            placeholder="e.g. North Avenue Street"
            required
            className="water-input"
          />
        </div>
      </div>

      {/* Team assignment */}
      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: '0.5rem 0 0 0', letterSpacing: '0.5px' }}>
        Supervisor & Staff Assignment
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div>
          <label className="water-label">Assigned Supervisor</label>
          <input 
            type="text" 
            name="assigned_supervisor"
            value={formData.assigned_supervisor}
            onChange={handleChange}
            placeholder="e.g. supervisor Davis"
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">Assigned Team name</label>
          <input 
            type="text" 
            name="assigned_team"
            value={formData.assigned_team}
            onChange={handleChange}
            placeholder="e.g. Leakage Crew A"
            className="water-input"
          />
        </div>
      </div>

      {/* Dates and Cost */}
      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: '0.5rem 0 0 0', letterSpacing: '0.5px' }}>
        Dates and Cost Details
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div>
          <label className="water-label">Scheduled Date</label>
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
          <label className="water-label">Estimated Cost ($)</label>
          <input 
            type="number" 
            name="estimated_cost"
            value={formData.estimated_cost}
            onChange={handleChange}
            placeholder="Estimated Budget"
            className="water-input"
          />
        </div>
      </div>

      {isEdit && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="water-label">Actual Start Date</label>
            <input 
              type="date" 
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Actual Completion Date</label>
            <input 
              type="date" 
              name="completed_date"
              value={formData.completed_date}
              onChange={handleChange}
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Actual Cost ($)</label>
            <input 
              type="number" 
              name="actual_cost"
              value={formData.actual_cost}
              onChange={handleChange}
              placeholder="Actual cost sum"
              className="water-input"
            />
          </div>
        </div>
      )}

      <div>
        <label className="water-label">Remarks</label>
        <input 
          type="text" 
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          placeholder="Special notes..."
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
          {isEdit ? 'Save Changes' : 'Schedule Job'}
        </button>
      </div>
    </form>
  );
}
