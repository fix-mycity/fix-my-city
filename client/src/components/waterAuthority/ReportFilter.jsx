import React from "react";

const WARDS = [
  'Ward 1 - Central Market',
  'Ward 2 - North Sector',
  'Ward 3 - South Hill',
  'Ward 4 - East Riverside',
  'Ward 5 - Industrial Park',
  'Ward 6 - West Suburb',
  'Ward 12 - Green Hills'
];

const ZONES = [
  'Central Zone',
  'West Zone',
  'East Zone',
  'South Zone',
  'North Zone'
];

export default function ReportFilter({ filters, onChange, onClear, onRefresh }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
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
      <div style={{ flex: '1 1 150px' }}>
        <label className="water-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>Municipal Ward</label>
        <select
          name="ward"
          value={filters.ward || ""}
          onChange={handleChange}
          className="water-select"
          style={{ height: '38px', fontSize: '0.85rem' }}
        >
          <option value="">All Wards</option>
          {WARDS.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
      </div>

      <div style={{ flex: '1 1 140px' }}>
        <label className="water-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>Zone Filter</label>
        <select
          name="zone"
          value={filters.zone || ""}
          onChange={handleChange}
          className="water-select"
          style={{ height: '38px', fontSize: '0.85rem' }}
        >
          <option value="">All Zones</option>
          {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
        </select>
      </div>

      <div style={{ flex: '1 1 140px' }}>
        <label className="water-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>Start Date</label>
        <input
          type="date"
          name="start_date"
          value={filters.start_date || ""}
          onChange={handleChange}
          className="water-input"
          style={{ height: '38px', fontSize: '0.85rem' }}
        />
      </div>

      <div style={{ flex: '1 1 140px' }}>
        <label className="water-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>End Date</label>
        <input
          type="date"
          name="end_date"
          value={filters.end_date || ""}
          onChange={handleChange}
          className="water-input"
          style={{ height: '38px', fontSize: '0.85rem' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={onRefresh}
          style={{
            height: '38px',
            padding: '0 1rem',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
          Refresh Analytics
        </button>

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
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>restart_alt</span>
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
