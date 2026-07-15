import React from 'react';

export default function ComplaintInfo({ complaint }) {
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
        <span className="material-symbols-outlined" style={{ color: 'var(--water-primary-light)' }}>person</span>
        Citizen & Report Details
      </h3>

      {/* Citizen Details */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: 'var(--water-bg)', padding: '0.85rem', borderRadius: '8px' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '2.2rem', color: 'var(--water-text-muted)', opacity: 0.7 }}>
          account_circle
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--water-text)' }}>
            {complaint.citizen_name || 'Anonymous Citizen'}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--water-text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>call</span>
            {complaint.phone || 'No phone logged'}
          </span>
          {complaint.email && (
            <span style={{ fontSize: '0.78rem', color: 'var(--water-text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>mail</span>
              {complaint.email}
            </span>
          )}
        </div>
      </div>

      {/* Complaint Title & Description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--water-text)' }}>
          {complaint.title}
        </h4>
        <p style={{
          fontSize: '0.88rem',
          color: '#334155',
          lineHeight: '1.5',
          whiteSpace: 'pre-line'
        }}>
          {complaint.description || "No further detailed description provided for this complaint."}
        </p>
      </div>
    </div>
  );
}
