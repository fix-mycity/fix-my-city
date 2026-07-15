import React, { useState } from 'react';

export default function AssignWorkerModal({ isOpen, onClose, onAssign, complaintNumber }) {
  const [workerId, setWorkerId] = useState('');
  const [notes, setNotes] = useState('');

  const mockWorkers = [
    { id: 101, name: "John Doe (Sector A Leak Specialist)" },
    { id: 102, name: "Sarah Connor (Mainline Welder)" },
    { id: 103, name: "Mike Tyson (Heavy Pipeline Excavator)" },
    { id: 104, name: "Robert Downey Jr. (Valve Calibration Tech)" }
  ];

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!workerId) return;
    onAssign(workerId, notes);
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
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--water-radius)',
        boxShadow: 'var(--water-shadow-md)',
        width: '100%',
        maxWidth: '460px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        border: '1px solid var(--water-border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--water-text)' }}>
            Assign Worker
          </h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--water-text-muted)' }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <p style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)' }}>
          Assigning a field worker to complaint: <strong style={{ color: 'var(--water-primary-light)' }}>{complaintNumber}</strong>
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--water-text)' }}>
              Select Field Worker *
            </label>
            <select
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: '8px',
                border: '1px solid var(--water-border)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            >
              <option value="">-- Choose Field Worker --</option>
              {mockWorkers.map((w) => (
                <option key={w.id} value={w.id}>
                  ID #{w.id} - {w.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--water-text)' }}>
              Assignment/Authority Notes
            </label>
            <textarea
              placeholder="Provide directions, instructions, or specific notes for the worker..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem',
                borderRadius: '8px',
                border: '1px solid var(--water-border)',
                fontSize: '0.85rem',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="water-btn" 
              style={{ padding: '0.55rem 1.1rem' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="water-btn water-btn-primary" 
              style={{ padding: '0.55rem 1.1rem' }}
              disabled={!workerId}
            >
              Assign Worker
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
