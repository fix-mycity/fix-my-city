import React from 'react';

export function ComplaintFilter({ filters, setFilters, onReset }) {
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
      {/* Category */}
      <select
        className="waste-form-select"
        style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
        value={filters.category || ''}
        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
      >
        <option value="">All Categories</option>
        <option value="Overflowing Bin">Overflowing Bin</option>
        <option value="Missed Collection">Missed Collection</option>
        <option value="Illegal Dumping">Illegal Dumping</option>
        <option value="Dead Animal">Dead Animal</option>
        <option value="Construction Waste">Construction Waste</option>
        <option value="Hazardous Waste">Hazardous Waste</option>
        <option value="Broken Bin">Broken Bin</option>
      </select>

      {/* Priority */}
      <select
        className="waste-form-select"
        style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
        value={filters.priority || ''}
        onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
      >
        <option value="">All Priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="CRITICAL">Critical</option>
      </select>

      {/* Status */}
      <select
        className="waste-form-select"
        style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
        value={filters.status || ''}
        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
      >
        <option value="">All Statuses</option>
        <option value="PENDING">Pending</option>
        <option value="ASSIGNED">Assigned</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="COMPLETED">Completed</option>
        <option value="REJECTED">Rejected</option>
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

export function ComplaintSearch({ searchQuery, setSearchQuery, sortBy, setSortBy }) {
  return (
    <div style={{
      display: 'flex',
      justify: 'space-between',
      alignItems: 'center',
      gap: '1rem',
      flexWrap: 'wrap',
      marginBottom: '1rem'
    }}>
      <div style={{ position: 'relative', flexGrow: 1, maxWidth: '400px' }}>
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
          placeholder="Search complaint #, title, area or citizen..."
          className="waste-form-input"
          style={{ paddingLeft: '2.4rem', width: '100%' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Sort By:</span>
        <select
          className="waste-form-select"
          style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="priority_high">Highest Priority</option>
          <option value="priority_low">Lowest Priority</option>
        </select>
      </div>
    </div>
  );
}
