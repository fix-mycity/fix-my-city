import React from 'react';

export default function ScheduleFilter({ filters, onChange, onReset }) {
  const statuses = ['SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'];
  const supplyTypes = ['REGULAR', 'SPECIAL', 'EMERGENCY'];
  const wards = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6'];
  const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'];

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
          Filter Schedules
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem'
      }}>
        {/* Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--water-text-muted)' }}>Status</label>
          <select 
            value={filters.status || ''} 
            onChange={(e) => handleSelectChange('status', e.target.value)}
            style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.8rem', outline: 'none' }}
          >
            <option value="">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Supply Type */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--water-text-muted)' }}>Supply Type</label>
          <select 
            value={filters.supply_type || ''} 
            onChange={(e) => handleSelectChange('supply_type', e.target.value)}
            style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.8rem', outline: 'none' }}
          >
            <option value="">All Types</option>
            {supplyTypes.map(t => <option key={t} value={t}>{t}</option>)}
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

        {/* Zone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--water-text-muted)' }}>Zone</label>
          <select 
            value={filters.zone || ''} 
            onChange={(e) => handleSelectChange('zone', e.target.value)}
            style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.8rem', outline: 'none' }}
          >
            <option value="">All Zones</option>
            {zones.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>

        {/* Supply Date */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--water-text-muted)' }}>Supply Date</label>
          <input 
            type="date"
            value={filters.supply_date || ''} 
            onChange={(e) => handleSelectChange('supply_date', e.target.value)}
            style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.8rem', outline: 'none', height: '32px' }}
          />
        </div>
      </div>
    </div>
  );
}
