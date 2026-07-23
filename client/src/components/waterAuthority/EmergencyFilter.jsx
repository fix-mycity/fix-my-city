import React from 'react';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['DECLARED', 'IN_PROGRESS', 'SUPPLY_STOPPED', 'REPAIRING', 'TESTING', 'RESTORED', 'CLOSED'];
const TYPES = ['PIPELINE_BURST', 'MAJOR_LEAK', 'CONTAMINATION', 'PUMP_FAILURE', 'POWER_FAILURE', 'TANK_DAMAGE', 'VALVE_FAILURE', 'FLOOD', 'MAINTENANCE', 'OTHER'];

export default function EmergencyFilter({ filters, onChange, onClear }) {
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value || null);
  };

  return (
    <div className="water-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end', padding: '1rem' }}>
      <div style={{ flex: '1 1 120px' }}>
        <label className="water-label" style={{ marginBottom: '0.25rem' }}>Zone</label>
        <input 
          type="text" 
          name="zone"
          value={filters.zone || ''}
          onChange={(e) => onChange('zone', e.target.value || null)}
          placeholder="Filter Zone"
          className="water-input"
          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
        />
      </div>

      <div style={{ flex: '1 1 120px' }}>
        <label className="water-label" style={{ marginBottom: '0.25rem' }}>Ward</label>
        <input 
          type="text" 
          name="ward"
          value={filters.ward || ''}
          onChange={(e) => onChange('ward', e.target.value || null)}
          placeholder="Filter Ward"
          className="water-input"
          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
        />
      </div>

      <div style={{ flex: '1 1 140px' }}>
        <label className="water-label" style={{ marginBottom: '0.25rem' }}>Priority</label>
        <select 
          name="priority"
          value={filters.priority || ''}
          onChange={handleSelectChange}
          className="water-input"
          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
        >
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: '1 1 140px' }}>
        <label className="water-label" style={{ marginBottom: '0.25rem' }}>Status</label>
        <select 
          name="status"
          value={filters.status || ''}
          onChange={handleSelectChange}
          className="water-input"
          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: '1 1 140px' }}>
        <label className="water-label" style={{ marginBottom: '0.25rem' }}>Emergency Type</label>
        <select 
          name="emergency_type"
          value={filters.emergency_type || ''}
          onChange={handleSelectChange}
          className="water-input"
          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
        >
          <option value="">All Types</option>
          {TYPES.map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <button 
        type="button" 
        onClick={onClear}
        className="water-btn"
        style={{
          padding: '0.4rem 0.8rem',
          fontSize: '0.8rem',
          borderColor: 'var(--water-border)',
          color: 'var(--water-text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          height: '34px'
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>filter_alt_off</span>
        Clear
      </button>
    </div>
  );
}
