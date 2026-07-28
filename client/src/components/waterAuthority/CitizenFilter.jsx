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

const AREAS = [
  "Shanti Nagar", "Green Glen", "Central Square", "Metro Hub", 
  "Riverside", "Fort", "West End", "Lakeview", "South Hill", "Green Hills Sector 4"
];

export default function CitizenFilter({ filters, onChange, onClear }) {
  const hasActiveFilters = filters.ward || filters.area || filters.status;

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
      <div style={{ flex: '1 1 160px' }}>
        <label className="water-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>Municipal Ward</label>
        <select
          value={filters.ward || ""}
          onChange={(e) => onChange({ ward: e.target.value })}
          className="water-select"
          style={{ height: '38px', fontSize: '0.85rem' }}
        >
          <option value="">All Wards</option>
          {WARDS.map((w, idx) => (
            <option key={idx} value={w}>{w}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: '1 1 160px' }}>
        <label className="water-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>Area / Locality</label>
        <select
          value={filters.area || ""}
          onChange={(e) => onChange({ area: e.target.value })}
          className="water-select"
          style={{ height: '38px', fontSize: '0.85rem' }}
        >
          <option value="">All Areas</option>
          {AREAS.map((a, idx) => (
            <option key={idx} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: '1 1 160px' }}>
        <label className="water-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>Service Access Status</label>
        <select
          value={filters.status || ""}
          onChange={(e) => onChange({ status: e.target.value })}
          className="water-select"
          style={{ height: '38px', fontSize: '0.85rem' }}
        >
          <option value="">All Access States</option>
          <option value="ENABLED">ENABLED</option>
          <option value="DISABLED">DISABLED</option>
        </select>
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
