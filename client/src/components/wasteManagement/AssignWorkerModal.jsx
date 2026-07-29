import React, { useState, useEffect } from 'react';
import { getWorkers } from '../../services/workerService';
import { assignWasteComplaintWorker } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export function AssignWorkerModal({ isOpen, onClose, onAssign, complaintNumber, complaint, onSuccess }) {
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(17, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  };

  const [deadline, setDeadline] = useState(getTomorrowString());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const displayComplaintNum = complaintNumber || complaint?.complaint_number || (complaint?.id ? `WC-2026-${complaint.id}` : 'Complaint');

  useEffect(() => {
    if (isOpen) {
      fetchWorkers();
      if (complaint?.assigned_worker_id) {
        setSelectedWorkerId(complaint.assigned_worker_id.toString());
      } else {
        setSelectedWorkerId('');
      }
      setNotes('');
      setPriority(complaint?.priority || 'MEDIUM');
      setDeadline(getTomorrowString());
    }
  }, [isOpen, complaint]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const response = await getWorkers({ department: 'waste', page_size: 100 });
      const items = response.data?.items || response.data || [];
      
      const formatted = items.map(w => {
        const fullName = `${w.first_name || ''} ${w.last_name || ''}`.trim();
        return {
          id: w.id,
          first_name: w.first_name,
          last_name: w.last_name,
          name: fullName || w.username || `Worker #${w.id}`,
          skill: w.skill || w.designation || 'Sanitation Worker',
          availability: w.availability || w.employment_status || 'ACTIVE',
          phone: w.phone || ''
        };
      });

      setWorkers(formatted);
    } catch (err) {
      console.error('Failed to load active workers:', err);
      toast.error('Failed to load active sanitation workers.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWorkerId || !deadline) {
      toast.error('Please select a field worker and deadline.');
      return;
    }

    if (onAssign) {
      onAssign(selectedWorkerId, notes, priority, deadline);
      onClose();
      return;
    }

    setSubmitting(true);
    try {
      if (complaint?.id) {
        await assignWasteComplaintWorker(complaint.id, selectedWorkerId, notes);
        try {
          await createAssignment({
            complaint_id: parseInt(complaint.id),
            worker_id: parseInt(selectedWorkerId),
            deadline: new Date(deadline).toISOString(),
            priority,
            remarks: notes || `Assigned for waste complaint #${displayComplaintNum}`
          });
        } catch (assignErr) {
          console.log('Work assignment record sync:', assignErr);
        }
      }
      toast.success('Field worker assigned successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to assign worker.');
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
        maxWidth: '480px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="material-symbols-outlined" style={{ color: '#059669' }}>group_add</span>
            Assign Field Worker
          </h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
          Create assignment for complaint: <strong style={{ color: '#059669' }}>{displayComplaintNum}</strong>
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0f172a' }}>
              Select Field Worker *
            </label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
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
              {loading ? (
                <option disabled>Loading workers...</option>
              ) : workers.length === 0 ? (
                <option value="">No active workers registered</option>
              ) : (
                <option value="">-- Choose Field Worker --</option>
              )}
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.skill}) - {w.availability}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0f172a' }}>
                Priority *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
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
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0f172a' }}>
                Deadline *
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0f172a' }}>
              Assignment / Authority Notes
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
              disabled={submitting || !selectedWorkerId || !deadline}
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
              {submitting ? 'Assigning...' : 'Assign Worker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignWorkerModal;
