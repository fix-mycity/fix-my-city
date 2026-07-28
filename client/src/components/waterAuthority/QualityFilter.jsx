import React from 'react';

const STATUSES = ['SAFE', 'WARNING', 'UNSAFE', 'UNDER_REVIEW'];
const SAMPLE_TYPES = ['PIPELINE', 'OVERHEAD_TANK', 'UNDERGROUND_TANK', 'PUBLIC_TAP', 'RESERVOIR'];
const WARDS = [
  'Ward 1 - Central Market',
  'Ward 2 - North Sector',
  'Ward 3 - South Hill',
  'Ward 4 - East Riverside',
  'Ward 5 - Industrial Park',
  'Ward 6 - West Suburb',
  'Ward 12 - Green Hills'
];

export default function QualityFilter({ filters, onChange, onClear }) {
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
          list="quality-ward-list"
          value={filters.ward || ''}
          onChange={(e) => onChange('ward', e.target.value || null)}
          placeholder="Filter by Ward..."
          className="water-input"
          style={{ height: '38px', fontSize: '0.85rem' }}
        />
        <datalist id="quality-ward-list">
          {WARDS.map(w => <option key={w} value={w} />)}
        </datalist>
      </div>

      <div style={{ flex: '1 1 150px' }}>
        <label className="water-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>Sample Type</label>
        <select 
          name="sample_type"
          value={filters.sample_type || ''}
          onChange={handleSelectChange}
          className="water-select"
          style={{ height: '38px', fontSize: '0.85rem' }}
        >
          <option value="">All Sample Types</option>
          {SAMPLE_TYPES.map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: '1 1 140px' }}>
        <label className="water-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>Overall Status</label>
        <select 
          name="overall_status"
          value={filters.overall_status || ''}
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

      <div style={{ flex: '1 1 140px' }}>
        <label className="water-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>Sample Date</label>
        <input 
          type="date" 
          name="sample_date"
          value={filters.sample_date || ''}
          onChange={(e) => onChange('sample_date', e.target.value || null)}
          className="water-input"
          style={{ height: '38px', fontSize: '0.85rem' }}
        />
      </div>

      {hasActiveFilters && (
        <button 
          type="button" 
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
