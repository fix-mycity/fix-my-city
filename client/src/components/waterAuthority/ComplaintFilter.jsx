import React from 'react';

export default function ComplaintFilter({ filters, onChange, onReset, sorting, onSortChange }) {
  const categories = ['NO_WATER', 'LOW_PRESSURE', 'PIPE_LEAK', 'DIRTY_WATER', 'BROKEN_PIPE', 'OVERFLOW', 'OTHER'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const statuses = ['NEW', 'ACCEPTED', 'WORKER_ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'REJECTED', 'CLOSED'];
  
  const wards = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6'];
  const areas = ['Green Park', 'Sector 4', 'Zone B', 'Central Expressway', 'Link Road', 'Sector 12'];

  const handleSelectChange = (key, value) => {
    onChange(key, value || null);
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid var(--water-border)',
      borderRadius: 'var(--water-radius)',
      padding: '1.25rem',
      boxShadow: 'var(--water-shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      marginBottom: '1.5rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--water-text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: 'var(--water-primary-light)' }}>filter_alt</span>
          Filter & Sort Operations
        </h4>
        <button 
          onClick={onReset}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--water-primary-light)',
            fontSize: '0.78rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>restart_alt</span>
          Reset Filters
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem'
      }}>
        {/* Category */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--water-text-muted)' }}>Category</label>
          <select 
            value={filters.category || ''} 
            onChange={(e) => handleSelectChange('category', e.target.value)}
            style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.8rem', outline: 'none' }}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
          </select>
        </div>

        {/* Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--water-text-muted)' }}>Status</label>
          <select 
            value={filters.status || ''} 
            onChange={(e) => handleSelectChange('status', e.target.value)}
            style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.8rem', outline: 'none' }}
          >
            <option value="">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>

        {/* Priority */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--water-text-muted)' }}>Priority</label>
          <select 
            value={filters.priority || ''} 
            onChange={(e) => handleSelectChange('priority', e.target.value)}
            style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.8rem', outline: 'none' }}
          >
            <option value="">All Priorities</option>
            {priorities.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Ward */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--water-text-muted)' }}>Ward</label>
          <select 
            value={filters.ward || ''} 
            onChange={(e) => handleSelectChange('ward', e.target.value)}
            style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.8rem', outline: 'none' }}
          >
            <option value="">All Wards</option>
            {wards.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>

        {/* Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--water-text-muted)' }}>Area</label>
          <select 
            value={filters.area || ''} 
            onChange={(e) => handleSelectChange('area', e.target.value)}
            style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.8rem', outline: 'none' }}
          >
            <option value="">All Areas</option>
            {areas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {/* Sorting */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--water-text-muted)' }}>Sort By</label>
          <select 
            value={sorting} 
            onChange={(e) => onSortChange(e.target.value)}
            style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.8rem', outline: 'none', fontWeight: '600' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Priority Order</option>
            <option value="status">Status Sequence</option>
          </select>
        </div>
      </div>
    </div>
  );
}
