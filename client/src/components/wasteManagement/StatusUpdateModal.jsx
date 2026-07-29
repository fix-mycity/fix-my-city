import React, { useState, useEffect } from 'react';
import { updateWasteComplaintStatus } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export function StatusUpdateModal({ isOpen, onClose, onUpdate, complaint, onSuccess }) {
  const [targetStatus, setTargetStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getAllowedTransitions = (currentStatus) => {
    switch (currentStatus) {
      case 'NEW':
      case 'PENDING':
        return [
          { status: 'ACCEPTED', label: 'Accept Complaint' },
          { status: 'REJECTED', label: 'Reject Complaint' },
          { status: 'CLOSED', label: 'Close Complaint' }
        ];
      case 'ACCEPTED':
        return [
          { status: 'ASSIGNED', label: 'Assign Field Staff' },
          { status: 'REJECTED', label: 'Reject Complaint' },
          { status: 'CLOSED', label: 'Close/Discard Complaint' }
        ];
      case 'ASSIGNED':
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
        return [
          { status: 'IN_PROGRESS', label: 'In Progress' },
          { status: 'COMPLETED', label: 'Completed' },
          { status: 'CLOSED', label: 'Closed' }
        ];
    }
  };

  const allowedTransitions = complaint ? getAllowedTransitions(complaint.status) : [];

  useEffect(() => {
    if (isOpen && complaint) {
      const transitions = getAllowedTransitions(complaint.status);
      if (transitions.length > 0) {
        setTargetStatus(transitions[0].status);
      } else {
        setTargetStatus('IN_PROGRESS');
      }
      setNotes('');
    }
  }, [isOpen, complaint]);

  if (!isOpen || !complaint) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetStatus) return;

    if (onUpdate) {
      onUpdate(targetStatus, notes);
      onClose();
      return;
    }

    setSubmitting(true);
    try {
      await updateWasteComplaintStatus(complaint.id, targetStatus, notes);
      toast.success(`Complaint status changed to ${targetStatus}`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update complaint status.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
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
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '460px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            Update Status
          </h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
          Updating status for complaint <strong style={{ color: '#059669' }}>{complaint.complaint_number}</strong> (Current: <strong>{complaint.status}</strong>)
        </p>

        {complaint.status === 'CLOSED' ? (
          <p style={{ fontSize: '0.88rem', color: '#ef4444', fontWeight: '600', margin: 0 }}>
            This complaint is already CLOSED.
          </p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0f172a' }}>
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
                  border: '1px solid #cbd5e1',
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
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0f172a' }}>
                Status Modification Notes / Remarks
              </label>
              <textarea
                placeholder="Provide details about why this status change is happening (e.g. site inspection completed, verified with residents)..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
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
                className="waste-btn waste-btn-secondary"
                style={{ padding: '0.55rem 1.1rem', borderRadius: '8px' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                className="waste-btn waste-btn-primary"
                style={{
                  padding: '0.55rem 1.1rem',
                  backgroundColor: '#059669',
                  borderColor: '#059669',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontWeight: '700'
                }}
              >
                {submitting ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default StatusUpdateModal;
