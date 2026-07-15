import React, { useState, useEffect } from 'react';

export default function StatusUpdateModal({ isOpen, onClose, onUpdate, complaint }) {
  const [targetStatus, setTargetStatus] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-determine allowed transitions on client side for convenience
  const getAllowedTransitions = (currentStatus) => {
    switch (currentStatus) {
      case 'NEW':
        return [
          { status: 'ACCEPTED', label: 'Accept Complaint' },
          { status: 'REJECTED', label: 'Reject Complaint' },
          { status: 'CLOSED', label: 'Close Complaint' }
        ];
      case 'ACCEPTED':
        return [
          { status: 'REJECTED', label: 'Reject Complaint' },
          { status: 'CLOSED', label: 'Close/Discard Complaint' }
        ];
      case 'WORKER_ASSIGNED':
        return [
          { status: 'IN_PROGRESS', label: 'Start Operations (In Progress)' },
          { status: 'CLOSED', label: 'Close Complaint' }
        ];
      case 'IN_PROGRESS':
        return [
          { status: 'COMPLETED', label: 'Mark as Completed' },
          { status: 'CLOSED', label: 'Close Complaint' }
        ];
      case 'COMPLETED':
        return [
          { status: 'VERIFIED', label: 'Verify Resolution' },
          { status: 'CLOSED', label: 'Close Complaint' }
        ];
      case 'VERIFIED':
      case 'REJECTED':
        return [
          { status: 'CLOSED', label: 'Archive & Close Complaint' }
        ];
      default:
        return [];
    }
  };

  const allowedTransitions = complaint ? getAllowedTransitions(complaint.status) : [];

  useEffect(() => {
    if (allowedTransitions.length > 0) {
      setTargetStatus(allowedTransitions[0].status);
    } else {
      setTargetStatus('');
    }
    setNotes('');
  }, [complaint]);

  if (!isOpen || !complaint) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetStatus) return;
    onUpdate(targetStatus, notes);
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
            Update Status
          </h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--water-text-muted)' }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)' }}>
          Updating status for complaint <strong style={{ color: 'var(--water-primary-light)' }}>{complaint.complaint_number}</strong> (Current: <strong>{complaint.status}</strong>)
        </p>

        {allowedTransitions.length === 0 ? (
          <p style={{ fontSize: '0.88rem', color: 'var(--water-danger)', fontWeight: '600' }}>
            No further status transitions are available for this complaint (it is already CLOSED).
          </p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--water-text)' }}>
                Target Status *
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
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
                {allowedTransitions.map((t) => (
                  <option key={t.status} value={t.status}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--water-text)' }}>
                Status Modification Notes / Remarks
              </label>
              <textarea
                placeholder="Provide details about why this status change is happening (e.g. site inspection completed, verified with local residents)..."
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
              >
                Update Status
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
