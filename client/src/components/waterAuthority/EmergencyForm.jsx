import React, { useState, useEffect } from 'react';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['DECLARED', 'IN_PROGRESS', 'SUPPLY_STOPPED', 'REPAIRING', 'TESTING', 'RESTORED', 'CLOSED'];
const TYPES = ['PIPELINE_BURST', 'MAJOR_LEAK', 'CONTAMINATION', 'PUMP_FAILURE', 'POWER_FAILURE', 'TANK_DAMAGE', 'VALVE_FAILURE', 'FLOOD', 'MAINTENANCE', 'OTHER'];

export default function EmergencyForm({ initialData = {}, pipelines = [], tanks = [], schedules = [], onSubmit, onCancel, isEdit = false }) {
  const [formData, setFormData] = useState({
    shutdown_number: initialData.shutdown_number || '',
    title: initialData.title || '',
    description: initialData.description || '',
    emergency_type: initialData.emergency_type || 'PIPELINE_BURST',
    priority: initialData.priority || 'MEDIUM',
    status: initialData.status || 'DECLARED',
    zone: initialData.zone || '',
    ward: initialData.ward || '',
    area: initialData.area || '',
    affected_pipeline_id: initialData.affected_pipeline_id || '',
    affected_tank_id: initialData.affected_tank_id || '',
    affected_schedule_id: initialData.affected_schedule_id || '',
    reason: initialData.reason || '',
    shutdown_start: initialData.shutdown_start ? new Date(initialData.shutdown_start).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    expected_restore_time: initialData.expected_restore_time ? new Date(initialData.expected_restore_time).toISOString().slice(0, 16) : '',
    assigned_supervisor: initialData.assigned_supervisor || '',
    assigned_team: initialData.assigned_team || '',
    remarks: initialData.remarks || '',
    actual_restore_time: initialData.actual_restore_time ? new Date(initialData.actual_restore_time).toISOString().slice(0, 16) : '',
    citizen_notification_sent: initialData.citizen_notification_sent || false
  });

  const [affectedAreas, setAffectedAreas] = useState(initialData.affected_areas || []);
  const [newArea, setNewArea] = useState({ zone: '', ward: '', area: '', population: '' });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddArea = () => {
    if (!newArea.ward.trim() || !newArea.area.trim()) {
      alert("Ward and Area are required to add an affected location.");
      return;
    }
    setAffectedAreas(prev => [...prev, {
      zone: newArea.zone || null,
      ward: newArea.ward,
      area: newArea.area,
      population: parseInt(newArea.population) || 0
    }]);
    setNewArea({ zone: '', ward: '', area: '', population: '' });
  };

  const handleRemoveArea = (index) => {
    setAffectedAreas(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!formData.ward.trim() || !formData.area.trim() || !formData.title.trim()) {
      alert("Title, Ward, and Area are required.");
      return;
    }

    const payload = {
      ...formData,
      affected_pipeline_id: formData.affected_pipeline_id ? parseInt(formData.affected_pipeline_id) : null,
      affected_tank_id: formData.affected_tank_id ? parseInt(formData.affected_tank_id) : null,
      affected_schedule_id: formData.affected_schedule_id ? parseInt(formData.affected_schedule_id) : null,
      shutdown_start: new Date(formData.shutdown_start).toISOString(),
      expected_restore_time: formData.expected_restore_time ? new Date(formData.expected_restore_time).toISOString() : null,
      actual_restore_time: formData.actual_restore_time ? new Date(formData.actual_restore_time).toISOString() : null,
      affected_areas: affectedAreas
    };

    if (!payload.shutdown_number.trim()) {
      delete payload.shutdown_number;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleFormSubmit} className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.75rem', margin: 0 }}>
        {isEdit ? `Edit Emergency: ${initialData.shutdown_number}` : 'Declare Emergency Shutdown'}
      </h3>

      {/* Main Parameters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div>
          <label className="water-label">Incident Number (Optional)</label>
          <input 
            type="text" 
            name="shutdown_number"
            value={formData.shutdown_number}
            onChange={handleChange}
            placeholder="e.g. ESD-123456"
            disabled={isEdit}
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">Emergency Type *</label>
          <select 
            name="emergency_type" 
            value={formData.emergency_type} 
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
          <label className="water-label">Incident Title *</label>
          <input 
            type="text" 
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Major pipe burst near Sector A market"
            required
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">Incident Status</label>
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

      <div>
        <label className="water-label">Description / Reason *</label>
        <textarea 
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the incident root cause..."
          className="water-input"
          style={{ height: '80px', fontFamily: 'inherit' }}
        />
      </div>

      {/* Linked Resources */}
      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: '0.5rem 0 0 0', letterSpacing: '0.5px' }}>
        Linked Infrastructure Resources
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div>
          <label className="water-label">Affected Pipeline</label>
          <select 
            name="affected_pipeline_id" 
            value={formData.affected_pipeline_id} 
            onChange={handleChange}
            className="water-input"
          >
            <option value="">None Selected</option>
            {pipelines.map(p => (
              <option key={p.id} value={p.id}>{p.pipeline_number} - {p.pipeline_name || p.pipeline_type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="water-label">Affected Water Tank</label>
          <select 
            name="affected_tank_id" 
            value={formData.affected_tank_id} 
            onChange={handleChange}
            className="water-input"
          >
            <option value="">None Selected</option>
            {tanks.map(t => (
              <option key={t.id} value={t.id}>{t.tank_number} - {t.tank_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="water-label">Associated Supply Schedule</label>
          <select 
            name="affected_schedule_id" 
            value={formData.affected_schedule_id} 
            onChange={handleChange}
            className="water-input"
          >
            <option value="">None Selected</option>
            {schedules.map(s => (
              <option key={s.id} value={s.id}>{s.schedule_number} - {s.ward} ({s.supply_type})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary Location */}
      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: '0.5rem 0 0 0', letterSpacing: '0.5px' }}>
        Epicenter Location
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

      {/* Dynamic Affected Areas */}
      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: '0.5rem 0 0 0', letterSpacing: '0.5px' }}>
        Affected Areas & Population Impacted
      </h4>
      <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', alignItems: 'flex-end' }}>
          <div>
            <label className="water-label" style={{ fontSize: '0.75rem' }}>Zone</label>
            <input 
              type="text" 
              value={newArea.zone} 
              onChange={e => setNewArea(p => ({ ...p, zone: e.target.value }))}
              placeholder="e.g. East" 
              className="water-input"
              style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
            />
          </div>
          <div>
            <label className="water-label" style={{ fontSize: '0.75rem' }}>Ward *</label>
            <input 
              type="text" 
              value={newArea.ward} 
              onChange={e => setNewArea(p => ({ ...p, ward: e.target.value }))}
              placeholder="e.g. Ward 1" 
              className="water-input"
              style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
            />
          </div>
          <div>
            <label className="water-label" style={{ fontSize: '0.75rem' }}>Area *</label>
            <input 
              type="text" 
              value={newArea.area} 
              onChange={e => setNewArea(p => ({ ...p, area: e.target.value }))}
              placeholder="e.g. Street C" 
              className="water-input"
              style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
            />
          </div>
          <div>
            <label className="water-label" style={{ fontSize: '0.75rem' }}>Population</label>
            <input 
              type="number" 
              value={newArea.population} 
              onChange={e => setNewArea(p => ({ ...p, population: e.target.value }))}
              placeholder="e.g. 500" 
              className="water-input"
              style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
            />
          </div>
          <button 
            type="button" 
            onClick={handleAddArea}
            className="water-btn"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', backgroundColor: 'var(--water-primary)', color: '#ffffff', border: 'none', height: '32px' }}
          >
            Add Location
          </button>
        </div>

        {/* Affected Areas list */}
        {affectedAreas.length > 0 && (
          <div style={{ marginTop: '0.5rem', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--water-border)', borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead style={{ backgroundColor: 'var(--water-bg-light)' }}>
                <tr>
                  <th style={{ padding: '0.5rem' }}>Zone</th>
                  <th style={{ padding: '0.5rem' }}>Ward</th>
                  <th style={{ padding: '0.5rem' }}>Area</th>
                  <th style={{ padding: '0.5rem' }}>Population</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>Remove</th>
                </tr>
              </thead>
              <tbody>
                {affectedAreas.map((area, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--water-border)' }}>
                    <td style={{ padding: '0.5rem' }}>{area.zone || '--'}</td>
                    <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{area.ward}</td>
                    <td style={{ padding: '0.5rem' }}>{area.area}</td>
                    <td style={{ padding: '0.5rem' }}>{area.population}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveArea(idx)}
                        style={{ border: 'none', background: 'none', color: 'var(--water-danger)', cursor: 'pointer', padding: 0 }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dates and Teams */}
      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: '0.5rem 0 0 0', letterSpacing: '0.5px' }}>
        Operation Details & Timeline
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
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
          <label className="water-label">Expected Restore Time</label>
          <input 
            type="datetime-local" 
            name="expected_restore_time"
            value={formData.expected_restore_time}
            onChange={handleChange}
            className="water-input"
          />
        </div>

        <div>
          <label className="water-label">Assigned Supervisor</label>
          <input 
            type="text" 
            name="assigned_supervisor"
            value={formData.assigned_supervisor}
            onChange={handleChange}
            placeholder="e.g. Supervisor Davis"
            className="water-input"
          />
        </div>
      </div>

      {isEdit && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="water-label">Actual Restore Time</label>
            <input 
              type="datetime-local" 
              name="actual_restore_time"
              value={formData.actual_restore_time}
              onChange={handleChange}
              className="water-input"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
              <input 
                type="checkbox" 
                name="citizen_notification_sent"
                checked={formData.citizen_notification_sent}
                onChange={handleChange}
              />
              Citizen Notifications Sent
            </label>
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
          {isEdit ? 'Save Changes' : 'Declare Shutdown'}
        </button>
      </div>
    </form>
  );
}
