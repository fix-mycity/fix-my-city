import React from 'react';
import { useNavigate } from 'react-router-dom';
import AssignmentStatusBadge from '../waterAuthority/AssignmentStatusBadge';

export default function TaskCard({ task }) {
  const navigate = useNavigate();

  const getPriorityColor = (p) => {
    switch (p?.toUpperCase()) {
      case 'CRITICAL':
        return '#ef4444';
      case 'HIGH':
        return '#f97316';
      case 'MEDIUM':
        return '#eab308';
      case 'LOW':
        return '#3b82f6';
      default:
        return '#64748b';
    }
  };

  return (
    <div 
      onClick={() => navigate(`/worker/tasks/${task.id}`)}
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--water-border)',
        borderRadius: '16px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        boxShadow: 'var(--water-shadow-sm)',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--water-text-muted)', textTransform: 'uppercase' }}>
            {task.assignment_number}
          </span>
          <h4 style={{ margin: '0.1rem 0 0', fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-text)' }}>
            Complaint #{task.complaint?.complaint_number || task.complaint_id}
          </h4>
        </div>
        <AssignmentStatusBadge status={task.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
        <div>
          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--water-text-muted)' }}>Ward / Area</span>
          <span style={{ fontWeight: '600', color: 'var(--water-text)' }}>
            {task.complaint?.ward || 'N/A'} / {task.complaint?.area || 'N/A'}
          </span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--water-text-muted)' }}>Priority</span>
          <span style={{ fontWeight: '800', color: getPriorityColor(task.priority) }}>
            {task.priority}
          </span>
        </div>
      </div>

      <div>
        <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--water-text-muted)' }}>Deadline</span>
        <span style={{ fontWeight: '600', color: new Date(task.deadline) < new Date() ? '#ef4444' : 'var(--water-text)' }}>
          {new Date(task.deadline).toLocaleString()}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/worker/tasks/${task.id}`);
          }}
          className="water-btn water-btn-primary"
          style={{
            width: '100%',
            padding: '0.45rem',
            fontSize: '0.78rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>play_circle</span>
          Open Task details
        </button>
      </div>
    </div>
  );
}
