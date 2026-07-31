import React, { useState, useEffect } from 'react';
import { getWorkers } from '../../services/workerService';

export default function AssignWorkerModal({ isOpen, onClose, onAssign, complaintNumber }) {
  const [workerId, setWorkerId] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  
  // Set default deadline to tomorrow
  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(17, 0, 0, 0); // Default to 5 PM tomorrow
    return tomorrow.toISOString().slice(0, 16);
  };
  
  const [deadline, setDeadline] = useState(getTomorrowString());
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchWorkers = async () => {
        setLoading(true);
        try {
          const response = await getWorkers({ department: 'water', page_size: 100 });
          const activeWorkers = (response.data.items || response.data || []).filter(
            w => w.employment_status === 'ACTIVE'
          );
          setWorkers(activeWorkers);
        } catch (err) {
          console.error("Error fetching workers for assignment:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchWorkers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!workerId || !deadline) return;
    onAssign(workerId, notes, priority, deadline);
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
        maxWidth: '480px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        border: '1px solid var(--water-border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--water-text)' }}>
            Assign Field Worker
          </h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--water-text-muted)' }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <p style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)' }}>
          Create assignment for complaint: <strong style={{ color: 'var(--water-primary-light)' }}>{complaintNumber}</strong>
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
              {loading ? (
                <option disabled>Loading workers...</option>
              ) : workers.length === 0 ? (
                <option value="">No active workers registered</option>
              ) : (
                <option value="">-- Choose Field Worker --</option>
              )}
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.first_name || w.username} {w.last_name || ''} ({w.skill || 'General'}) - {w.availability || 'AVAILABLE'}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--water-text)' }}>
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
                  border: '1px solid var(--water-border)',
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
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--water-text)' }}>
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
                  border: '1px solid var(--water-border)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
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
              disabled={!workerId || !deadline}
            >
              Assign Worker
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

