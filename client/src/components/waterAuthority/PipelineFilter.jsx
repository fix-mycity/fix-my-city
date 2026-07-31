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

  const hasActiveFilters = Object.values(filters).some(val => val !== null && val !== '');

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '1rem 1.25rem',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      alignItems: 'flex-end',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
    }}>
      <div style={{ flex: '1 1 140px' }}>
        <label className="water-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>Ward</label>
        <input 
          type="text" 
          name="ward"
          value={filters.ward || ''}
          onChange={(e) => onChange('ward', e.target.value || null)}
          placeholder="Filter by Ward..."
          className="water-input"
          style={{ height: '38px', fontSize: '0.85rem' }}
        />
      </div>

      <div style={{ flex: '1 1 150px' }}>
        <label className="water-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>Pipeline Type</label>
        <select 
          name="pipeline_type"
          value={filters.pipeline_type || ''}
          onChange={handleSelectChange}
          className="water-select"
          style={{ height: '38px', fontSize: '0.85rem' }}
        >
          <option value="">All Types</option>
          {PIPELINE_TYPES.map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: '1 1 130px' }}>
        <label className="water-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>Material</label>
        <select 
          name="material"
          value={filters.material || ''}
          onChange={handleSelectChange}
          className="water-select"
          style={{ height: '38px', fontSize: '0.85rem' }}
        >
          <option value="">All Materials</option>
          {MATERIALS.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: '1 1 130px' }}>
        <label className="water-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>Condition</label>
        <select 
          name="condition"
          value={filters.condition || ''}
          onChange={handleSelectChange}
          className="water-select"
          style={{ height: '38px', fontSize: '0.85rem' }}
        >
          <option value="">All Conditions</option>
          {CONDITIONS.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: '1 1 130px' }}>
        <label className="water-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>Status</label>
        <select 
          name="status"
          value={filters.status || ''}
          onChange={handleSelectChange}
          className="water-select"
          style={{ height: '38px', fontSize: '0.85rem' }}
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button 
          onClick={onClear}
          style={{
            height: '38px',
            padding: '0 1rem',
            border: '1px solid #fca5a5',
            backgroundColor: '#fff5f5',
            color: '#dc2626',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>restart_alt</span>
          Reset Filters
        </button>
      )}
    </div>
  );
}
