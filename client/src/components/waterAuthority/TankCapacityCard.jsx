import React from 'react';

export default function TankCapacityCard({ capacity, minLevel, maxLevel, waterSource, pipeline }) {
  return (
    <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
        Capacity & Connected Systems
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
        <div>
          <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Maximum Capacity</span>
          <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{capacity.toLocaleString()} Liters</span>
        </div>
        <div>
          <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Water Source</span>
          <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{waterSource || 'N/A'}</span>
        </div>
        <div>
          <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Min Level Alert Trigger</span>
          <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>
            {minLevel ? `${minLevel.toLocaleString()} Liters` : 'Default (20%)'}
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Max Level Cap Trigger</span>
          <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>
            {maxLevel ? `${maxLevel.toLocaleString()} Liters` : 'Default (100%)'}
          </span>
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Connected Feed Pipeline</span>
          <span style={{ fontWeight: '700', color: 'var(--water-primary-light)' }}>
            {pipeline ? `${pipeline.pipeline_number} (${pipeline.pipeline_name || 'Unnamed'})` : 'No connected pipeline'}
          </span>
        </div>
      </div>
    </div>
  );
}
