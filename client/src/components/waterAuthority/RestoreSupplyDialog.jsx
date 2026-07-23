import React, { useState } from 'react';

export default function RestoreSupplyDialog({ isOpen, onClose, onSubmit, title = "Restore Water Supply" }) {
  if (!isOpen) return null;

  const [remarks, setRemarks] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(remarks);
    setRemarks('');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <form onSubmit={handleFormSubmit} className="water-card" style={{
        width: '100%',
        maxWidth: '380px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--water-primary)', margin: 0 }}>
            {title}
          </h3>
          <button 
            type="button" 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--water-text-muted)', display: 'flex', padding: 0 }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div>
          <label className="water-label">Closing / Restoration Remarks *</label>
          <textarea 
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Provide status updates, repairs performed, water pressure test results, etc..."
            required
            className="water-input"
            style={{ height: '80px', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button 
            type="button" 
            onClick={onClose}
            className="water-btn"
            style={{ borderColor: 'var(--water-border)', color: 'var(--water-text)' }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="water-btn"
            style={{ backgroundColor: 'var(--water-primary)', color: '#ffffff', border: 'none', fontWeight: '700' }}
          >
            Confirm Status Update
          </button>
        </div>
      </form>
    </div>
  );
}
