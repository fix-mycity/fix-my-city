import React from 'react';

export default function AssignmentFilter({ filters, onChange, onClear }) {
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const handleSearchChange = (e) => {
    onChange('search', e.target.value);
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid var(--water-border)',
      borderRadius: '12px',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      boxShadow: 'var(--water-shadow-sm)'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
        {/* Search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--water-text)' }}>
            Search Assignments / Worker
          </label>
          <div style={{ position: 'relative' }}>
            <span className="material-symbols-outlined" style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--water-text-muted)',
              fontSize: '1.15rem'
            }}>
              search
            </span>
            <input
              type="text"
              placeholder="Search ID, Worker Name..."
              value={filters.search || ''}
              onChange={handleSearchChange}
              style={{
                width: '100%',
                padding: '0.55rem 0.6rem 0.55rem 2.2rem',
                borderRadius: '8px',
                border: '1px solid var(--water-border)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--water-text)' }}>
            Filter by Status
          </label>
          <select
            name="status"
            value={filters.status || ''}
            onChange={handleSelectChange}
            style={{
              width: '100%',
              padding: '0.55rem',
              borderRadius: '8px',
              border: '1px solid var(--water-border)',
              fontSize: '0.85rem',
              outline: 'none',
              backgroundColor: '#ffffff'
            }}
          >
            <option value="">All Statuses</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
            <option value="TRAVELLING">Travelling</option>
            <option value="ARRIVED">Arrived</option>
            <option value="WORK_STARTED">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="VERIFIED">Verified & Closed</option>
            <option value="REOPENED">Reopened</option>
          </select>
        </div>

        {/* Priority */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--water-text)' }}>
            Filter by Priority
          </label>
          <select
            name="priority"
            value={filters.priority || ''}
            onChange={handleSelectChange}
            style={{
              width: '100%',
              padding: '0.55rem',
              borderRadius: '8px',
              border: '1px solid var(--water-border)',
              fontSize: '0.85rem',
              outline: 'none',
              backgroundColor: '#ffffff'
            }}
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
        <button
          onClick={onClear}
          className="water-btn"
          style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>clear_all</span>
          Clear Filters
        </button>
      </div>
    </div>
  );
}
