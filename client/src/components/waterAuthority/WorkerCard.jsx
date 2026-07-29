import React from 'react';
import WorkerStatusBadge from './WorkerStatusBadge';
import WorkerAvailabilityBadge from './WorkerAvailabilityBadge';

export default function WorkerCard({ 
  worker, 
  onViewProfile, 
  onEditWorker, 
  onToggleStatus, 
  onDeleteWorker 
}) {
  const {
    id,
    first_name,
    last_name,
    phone,
    photo,
    skill,
    place,
    pin_code,
    employment_status,
    availability,
    status_updated_at
  } = worker;

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
      position: 'relative',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'default'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = 'var(--water-shadow-md)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = 'var(--water-shadow-sm)';
    }}
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: '#e2e8f0',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {photo ? (
            <img src={photo} alt={`${first_name}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: '#64748b' }}>person</span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', overflow: 'hidden' }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--water-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {first_name} {last_name}
          </h4>

        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <WorkerAvailabilityBadge availability={availability} statusUpdatedAt={status_updated_at} />
        <WorkerStatusBadge status={employment_status} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', borderTop: '1px solid var(--water-border)', paddingTop: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--water-text-muted)', fontWeight: '500' }}>Skill:</span>
          <span style={{ fontWeight: '700', color: 'var(--water-primary-dark)' }}>{skill || 'General'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--water-text-muted)', fontWeight: '500' }}>Place / Pin Code:</span>
          <span style={{ fontWeight: '600' }}>{place || 'N/A'} / {pin_code || 'N/A'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--water-text-muted)', fontWeight: '500' }}>Phone:</span>
          <span style={{ fontWeight: '600', color: 'var(--water-text)' }}>{phone}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--water-border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
        <button 
          onClick={() => onViewProfile(id)}
          className="water-btn"
          style={{ flexGrow: 1, padding: '0.4rem 0.5rem', fontSize: '0.75rem', border: '1px solid var(--water-primary-light)', color: 'var(--water-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>visibility</span>
          Profile
        </button>
        <button 
          onClick={() => onEditWorker(id)}
          className="water-btn"
          style={{ flexGrow: 1, padding: '0.4rem 0.5rem', fontSize: '0.75rem', border: '1px solid var(--water-warning)', color: 'var(--water-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>edit</span>
          Edit
        </button>
        <button 
          onClick={() => onToggleStatus(worker)}
          className="water-btn"
          style={{ 
            padding: '0.4rem 0.6rem', 
            border: employment_status === 'ACTIVE' ? '1px solid var(--water-danger)' : '1px solid var(--water-success)', 
            color: employment_status === 'ACTIVE' ? 'var(--water-danger)' : 'var(--water-success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          title={employment_status === 'ACTIVE' ? "Deactivate" : "Activate"}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
            {employment_status === 'ACTIVE' ? 'person_off' : 'person_play'}
          </span>
        </button>
        <button 
          onClick={() => onDeleteWorker(id)}
          className="water-btn"
          style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--water-danger)', color: 'var(--water-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Delete"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete</span>
        </button>
      </div>
    </div>
  );
}
