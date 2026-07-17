import React from 'react';

export default function DeactivateWorkerDialog({ isOpen, onClose, onConfirm, worker }) {
  if (!isOpen || !worker) return null;

  const isActive = worker.employment_status === 'ACTIVE';
  const actionLabel = isActive ? 'Deactivate' : 'Activate';
  const color = isActive ? 'var(--water-danger)' : 'var(--water-success)';

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(worker.id, isActive ? 'INACTIVE' : 'ACTIVE');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--water-radius)',
        boxShadow: 'var(--water-shadow-md)',
        width: '100%',
        maxWidth: '440px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        border: '1px solid var(--water-border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--water-text)' }}>
            Confirm Status Change
          </h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--water-text-muted)' }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', margin: '0.5rem 0' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '2rem', color }}>
            {isActive ? 'person_off' : 'person_play'}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--water-text)', fontWeight: '600' }}>
              Are you sure you want to {actionLabel.toLowerCase()} this worker?
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--water-text-muted)' }}>
              Worker: <strong>{worker.first_name} {worker.last_name}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button 
            type="button" 
            onClick={onClose} 
            className="water-btn" 
            style={{ padding: '0.5rem 1rem' }}
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSubmit} 
            className="water-btn"
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: color, 
              color: '#ffffff', 
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {actionLabel} Worker
          </button>
        </div>
      </div>
    </div>
  );
}
