import React from 'react';

const PIPELINE_TYPES = ['MAIN_LINE', 'SUB_LINE', 'SERVICE_LINE', 'DISTRIBUTION_LINE'];
const MATERIALS = ['PVC', 'HDPE', 'DI', 'STEEL', 'CI', 'OTHER'];
const CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'];
const STATUSES = ['ACTIVE', 'UNDER_MAINTENANCE', 'DAMAGED', 'OUT_OF_SERVICE', 'REPLACED'];

export default function PipelineFilter({ filters, onChange, onClear }) {
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
        <label className="water-label" style={{ marginBottom: '0.25rem' }}>Type</label>
        <select 
          name="pipeline_type"
          value={filters.pipeline_type || ''}
          onChange={handleSelectChange}
          className="water-input"
          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
        >
          <option value="">All Types</option>
          {PIPELINE_TYPES.map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: '1 1 120px' }}>
        <label className="water-label" style={{ marginBottom: '0.25rem' }}>Material</label>
        <select 
          name="material"
          value={filters.material || ''}
          onChange={handleSelectChange}
          className="water-input"
          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
        >
          <option value="">All Materials</option>
          {MATERIALS.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: '1 1 120px' }}>
        <label className="water-label" style={{ marginBottom: '0.25rem' }}>Condition</label>
        <select 
          name="condition"
          value={filters.condition || ''}
          onChange={handleSelectChange}
          className="water-input"
          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
        >
          <option value="">All Conditions</option>
          {CONDITIONS.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: '1 1 120px' }}>
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
