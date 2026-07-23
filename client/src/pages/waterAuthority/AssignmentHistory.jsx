import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getAssignments } from '../../services/assignmentService';
import AssignmentStatusBadge from '../../components/waterAuthority/AssignmentStatusBadge';

export default function AssignmentHistory() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHistoryList = async () => {
    setLoading(true);
    try {
      // Load all assignments for timeline audit
      const response = await getAssignments({ page_size: 1000 });
      setAssignments(response.data.items || []);
    } catch (err) {
      toast.error("Failed to load timeline audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryList();
  }, []);

  const filteredAssignments = assignments.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.assignment_number.toLowerCase().includes(searchLower) ||
      (item.worker && `${item.worker.first_name} ${item.worker.last_name}`.toLowerCase().includes(searchLower)) ||
      (item.complaint && item.complaint.complaint_number.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button 
            onClick={() => navigate('/water/assignments')}
            className="water-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: 'none', color: 'var(--water-primary-light)', fontWeight: '700', padding: 0 }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Active Board
          </button>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--water-text)', marginTop: '0.5rem' }}>
            Work Orders Audit Trail
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)', margin: '0.2rem 0 0' }}>
            Full timeline history and status transit logs for all municipal maintenance assignments.
          </p>
        </div>
      </div>

      {/* Search Filter Box */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--water-border)',
        borderRadius: '12px',
        padding: '1rem',
        boxShadow: 'var(--water-shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span className="material-symbols-outlined" style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--water-text-muted)',
            fontSize: '1.15rem'
          }}>
            search
          </span>
          <input
            type="text"
            placeholder="Search audit trail by WA number, worker name or complaint ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.6rem 0.6rem 2.2rem',
              borderRadius: '8px',
              border: '1px solid var(--water-border)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Timeline Audit Logs List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <span className="material-symbols-outlined animate-spin" style={{ fontSize: '2.5rem', color: 'var(--water-primary-light)' }}>
            sync
          </span>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--water-border)', color: 'var(--water-text-muted)' }}>
          No historical audit trails found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredAssignments.map((item) => {
            const hasUpdates = item.task_updates && item.task_updates.length > 0;
            const lastUpdate = hasUpdates 
              ? [...item.task_updates].sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0]
              : null;

            return (
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
                onClick={() => navigate(`/water/assignments/${item.id}`)}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--water-primary-light)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--water-border)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ color: 'var(--water-primary-light)', fontSize: '0.95rem' }}>{item.assignment_number}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--water-text-muted)' }}>• Complaint #{item.complaint?.complaint_number || item.complaint_id}</span>
                    </div>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--water-text)' }}>
                      Assigned to: <strong>{item.worker ? `${item.worker.first_name} ${item.worker.last_name}` : 'Unassigned'}</strong>
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                    <AssignmentStatusBadge status={item.status} />
                    <span style={{ fontSize: '0.72rem', color: 'var(--water-text-muted)' }}>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Last Update Summary Banner */}
                {lastUpdate ? (
                  <div style={{
                    marginTop: '0.75rem',
                    backgroundColor: '#f8fafc',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    border: '1px dashed #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>Latest Event ({lastUpdate.status}):</span>
                      <span style={{ color: 'var(--water-text-muted)', marginLeft: '0.4rem' }}>{lastUpdate.remarks || 'No remarks logged.'}</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--water-text-muted)' }}>
                      {new Date(lastUpdate.created_at).toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--water-text-muted)' }}>
                    No updates logged by field workers yet.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
