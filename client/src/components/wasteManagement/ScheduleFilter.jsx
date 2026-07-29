import React from 'react';

export function ScheduleFilter({ filters, setFilters, onReset }) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.75rem',
      alignItems: 'center',
      padding: '0.85rem 1rem',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      marginBottom: '1rem'
    }}>
      {/* Status */}
      <select
        className="waste-form-select"
        style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
        value={filters.status || ''}
        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
      >
        <option value="">All Statuses</option>
        <option value="Scheduled">Scheduled</option>
        <option value="Started">Started</option>
        <option value="Completed">Completed</option>
        <option value="Cancelled">Cancelled</option>
      </select>

      {/* Waste Type */}
      <select
        className="waste-form-select"
        style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
        value={filters.waste_type || ''}
        onChange={(e) => setFilters({ ...filters, waste_type: e.target.value })}
      >
        <option value="">All Waste Types</option>
        <option value="General Waste">General Waste</option>
        <option value="Organic">Organic</option>
        <option value="Plastic">Plastic</option>
        <option value="Glass">Glass</option>
        <option value="Hazardous">Hazardous</option>
        <option value="Electronic">Electronic</option>
      </select>

      {/* Ward */}
      <input
        type="text"
        placeholder="Filter Ward..."
        className="waste-form-input"
        style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem', width: '130px' }}
        value={filters.ward || ''}
        onChange={(e) => setFilters({ ...filters, ward: e.target.value })}
      />

      {/* Scheduled Date */}
      <input
        type="date"
        className="waste-form-input"
        style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
        value={filters.scheduled_date || ''}
        onChange={(e) => setFilters({ ...filters, scheduled_date: e.target.value })}
      />

      <button
        onClick={onReset}
        className="waste-btn waste-btn-secondary"
        style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>restart_alt</span>
        Reset
      </button>
    </div>
  );
}

export function ScheduleSearch({ searchQuery, setSearchQuery }) {
  return (
    <div style={{
      marginBottom: '1rem',
      maxWidth: '450px'
    }}>
      <div style={{ position: 'relative' }}>
        <span className="material-symbols-outlined" style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#94a3b8',
          fontSize: '20px'
        }}>
          search
        </span>
        <input
          type="text"
          placeholder="Search route code, route name, area..."
          className="waste-form-input"
          style={{ paddingLeft: '2.4rem', width: '100%' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
}
