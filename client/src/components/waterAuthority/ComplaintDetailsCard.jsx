import React from 'react';
import ComplaintPriorityBadge from './ComplaintPriorityBadge';

export default function ComplaintDetailsCard({ complaint }) {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid var(--water-border)',
      borderRadius: 'var(--water-radius)',
      padding: '1.5rem',
      boxShadow: 'var(--water-shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      height: '100%'
    }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--water-text)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.75rem' }}>
        <span className="material-symbols-outlined" style={{ color: 'var(--water-primary-light)' }}>pin_drop</span>
        Location & category
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem' }}>
        {/* Ward & Area */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc', paddingBottom: '0.5rem' }}>
          <span style={{ fontWeight: '600', color: 'var(--water-text-muted)' }}>Ward / Area:</span>
          <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>
            {complaint.ward || 'N/A'} • {complaint.area || 'N/A'}
          </span>
        </div>

        {/* Address */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderBottom: '1px solid #f8fafc', paddingBottom: '0.5rem' }}>
          <span style={{ fontWeight: '600', color: 'var(--water-text-muted)' }}>Address Description:</span>
          <span style={{ color: 'var(--water-text)', lineHeight: '1.4' }}>
            {complaint.address || 'No address logged.'}
          </span>
        </div>

        {/* Latitude & Longitude */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc', paddingBottom: '0.5rem' }}>
          <span style={{ fontWeight: '600', color: 'var(--water-text-muted)' }}>Coordinates:</span>
          <span style={{ color: 'var(--water-text)', fontWeight: '600', fontFamily: 'monospace' }}>
            {complaint.latitude?.toFixed(5) || '0.00000'}, {complaint.longitude?.toFixed(5) || '0.00000'}
          </span>
        </div>

        {/* Category */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8fafc', paddingBottom: '0.5rem' }}>
          <span style={{ fontWeight: '600', color: 'var(--water-text-muted)' }}>Category:</span>
          <span style={{ color: 'var(--water-primary-light)', fontWeight: '700' }}>
            {complaint.category?.replace('_', ' ')}
          </span>
        </div>

        {/* Priority */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '600', color: 'var(--water-text-muted)' }}>Reported Priority:</span>
          <ComplaintPriorityBadge priority={complaint.priority} />
        </div>
      </div>
    </div>
  );
}
