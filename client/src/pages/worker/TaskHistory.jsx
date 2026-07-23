import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getWorkerTasks } from '../../services/workerTaskService';
import AssignmentStatusBadge from '../../components/waterAuthority/AssignmentStatusBadge';

export default function TaskHistory() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await getWorkerTasks({ page_size: 1000 });
      const completedTasks = (response.data.items || []).filter(
        t => ['COMPLETED', 'VERIFIED'].includes(t.status)
      );
      setTasks(completedTasks);
    } catch (err) {
      toast.error("Failed to load completed task logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div>
        <button 
          onClick={() => navigate('/worker/dashboard')}
          className="water-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: 'none', color: 'var(--water-primary-light)', fontWeight: '700', padding: 0 }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Portal
        </button>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--water-text)', marginTop: '0.5rem' }}>
          Completed Repairs History
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)', margin: '0.2rem 0 0' }}>
          Overview of all municipal pipeline repairs and water tasks successfully resolved and signed off by you.
        </p>
      </div>

      {/* Main List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <span className="material-symbols-outlined animate-spin" style={{ fontSize: '2.5rem', color: 'var(--water-primary-light)' }}>
            sync
          </span>
        </div>
      ) : tasks.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--water-border)', color: 'var(--water-text-muted)' }}>
          No completed repairs found in your log history.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tasks.map((item) => (
            <div 
              key={item.id} 
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--water-border)',
                borderRadius: '12px',
                padding: '1.25rem',
                boxShadow: 'var(--water-shadow-sm)',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease'
              }}
              onClick={() => navigate(`/worker/tasks/${item.id}`)}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--water-primary-light)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--water-border)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ color: 'var(--water-primary-light)', fontSize: '0.95rem' }}>{item.assignment_number}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--water-text-muted)' }}>• Complaint #{item.complaint?.complaint_number || item.complaint_id}</span>
                  </div>
                  <h4 style={{ margin: '0.2rem 0 0', fontSize: '0.9rem', color: 'var(--water-text)' }}>
                    {item.complaint?.title || 'Pipe Leakage Repair'}
                  </h4>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--water-text-muted)' }}>
                    Resolved at: {new Date(item.updated_at).toLocaleString()}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                  <AssignmentStatusBadge status={item.status} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--water-text-muted)' }}>Assigned: {new Date(item.assigned_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
