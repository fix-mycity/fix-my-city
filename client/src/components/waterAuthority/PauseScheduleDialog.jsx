import React, { useState } from 'react';

export default function PauseScheduleDialog({ isOpen, onClose, onConfirm, schedule }) {
  const [remarks, setRemarks] = useState('');

  if (!isOpen || !schedule) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(schedule.id, remarks);
    setRemarks('');
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
            Pause Water Supply
          </h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--water-text-muted)' }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', margin: '0.5rem 0' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '2.2rem', color: 'var(--water-warning)' }}>
            pause_circle
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--water-text)', fontWeight: '600' }}>
              Are you sure you want to pause this water supply schedule?
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--water-text-muted)' }}>
              Schedule Number: <strong>{schedule.schedule_number}</strong>
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--water-text-muted)' }}>
              Area: <strong>{schedule.ward} - {schedule.area}</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--water-text)' }}>
            Reason / Remarks
          </label>
          <textarea
            required
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Provide a reason for pausing (e.g. maintenance work, leak detection, low pressure)"
            style={{
              padding: '0.5rem 0.75rem',
              fontSize: '0.85rem',
              borderRadius: '6px',
              border: '1px solid var(--water-border)',
              minHeight: '80px',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="water-btn" 
              style={{ padding: '0.5rem 1rem' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: 'var(--water-warning)', 
                color: '#ffffff', 
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Pause Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
