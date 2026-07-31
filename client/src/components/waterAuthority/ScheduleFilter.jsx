import React from 'react';

const STATUSES = ['SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'];
const SUPPLY_TYPES = ['REGULAR', 'SPECIAL', 'EMERGENCY'];
const WARDS = [
  'Ward 1 - Central Market',
  'Ward 2 - North Sector',
  'Ward 3 - South Hill',
  'Ward 4 - East Riverside',
  'Ward 5 - Industrial Park',
  'Ward 6 - West Suburb',
  'Ward 12 - Green Hills'
];

export default function ScheduleFilter({ filters, onChange, onReset }) {
  const handleSelectChange = (key, value) => {
    onChange(key, value || null);
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
          list="filter-ward-list"
          value={filters.ward || ''}
          onChange={(e) => handleSelectChange('ward', e.target.value)}
          placeholder="Filter by Ward..."
          className="water-input"
          style={{ height: '38px', fontSize: '0.85rem' }}
        />
        <datalist id="filter-ward-list">
          {WARDS.map(w => <option key={w} value={w} />)}
        </datalist>
      </div>

      <div style={{ flex: '1 1 150px' }}>
        <label className="water-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>Supply Type</label>
        <select 
          value={filters.supply_type || ''} 
          onChange={(e) => handleSelectChange('supply_type', e.target.value)}
          className="water-select"
          style={{ height: '38px', fontSize: '0.85rem' }}
        >
          <option value="">All Types</option>
          {SUPPLY_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: '1 1 140px' }}>
        <label className="water-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>Status</label>
        <select 
          value={filters.status || ''} 
          onChange={(e) => handleSelectChange('status', e.target.value)}
          className="water-select"
          style={{ height: '38px', fontSize: '0.85rem' }}
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: '1 1 140px' }}>
        <label className="water-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>Supply Date</label>
        <input 
          type="date"
          value={filters.supply_date || ''}
          onChange={(e) => handleSelectChange('supply_date', e.target.value)}
          className="water-input"
          style={{ height: '38px', fontSize: '0.85rem' }}
        />
      </div>

      {hasActiveFilters && (
        <button 
          type="button" 
          onClick={onReset}
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
