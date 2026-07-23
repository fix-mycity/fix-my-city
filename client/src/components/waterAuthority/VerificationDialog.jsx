import React, { useState } from 'react';

export default function VerificationDialog({ isOpen, onClose, onVerify, assignmentNumber }) {
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState('APPROVED'); // APPROVED or REJECTED

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onVerify(status, remarks);
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
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
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
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--water-text)' }}>
            Authority Verification
          </h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--water-text-muted)' }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)', margin: 0 }}>
          Verify the work completed for assignment: <strong style={{ color: 'var(--water-primary-light)' }}>{assignmentNumber}</strong>
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Status Choice */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--water-text)' }}>
              Verification Verdict *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.2rem' }}>
              <button
                type="button"
                onClick={() => setStatus('APPROVED')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem',
                  borderRadius: '10px',
                  border: status === 'APPROVED' ? '2px solid var(--water-success)' : '1px solid var(--water-border)',
                  backgroundColor: status === 'APPROVED' ? '#dcfce7' : '#ffffff',
                  color: status === 'APPROVED' ? '#15803d' : 'var(--water-text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span className="material-symbols-outlined">check_circle</span>
                Approve & Close
              </button>
              <button
                type="button"
                onClick={() => setStatus('REJECTED')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem',
                  borderRadius: '10px',
                  border: status === 'REJECTED' ? '2px solid var(--water-danger)' : '1px solid var(--water-border)',
                  backgroundColor: status === 'REJECTED' ? '#fee2e2' : '#ffffff',
                  color: status === 'REJECTED' ? '#b91c1c' : 'var(--water-text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span className="material-symbols-outlined">replay</span>
                Reject & Reopen
              </button>
            </div>
          </div>

          {/* Remarks input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--water-text)' }}>
              Verification Remarks / Instructions
            </label>
            <textarea
              required={status === 'REJECTED'}
              placeholder={status === 'REJECTED' ? "Provide details on why work was rejected and next steps..." : "Provide any remarks regarding approval..."}
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
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
              className={`water-btn ${status === 'APPROVED' ? 'water-btn-success' : 'water-btn-danger'}`} 
              style={{
                padding: '0.55rem 1.1rem',
                backgroundColor: status === 'APPROVED' ? 'var(--water-success)' : 'var(--water-danger)',
                borderColor: status === 'APPROVED' ? 'var(--water-success)' : 'var(--water-danger)',
                color: '#ffffff',
                fontWeight: '700'
              }}
            >
              {status === 'APPROVED' ? 'Approve' : 'Reject & Reopen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
