import React from 'react';
import { useNavigate } from 'react-router-dom';
import AssignmentStatusBadge from './AssignmentStatusBadge';

export default function AssignmentCard({ assignment }) {
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

  const isOverdue = new Date(assignment.deadline) < new Date() && assignment.status !== 'VERIFIED';

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: isOverdue ? '1.5px solid #ef4444' : '1px solid var(--water-border)',
      borderRadius: '16px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem',
      boxShadow: 'var(--water-shadow-sm)',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
    }} onClick={() => navigate(`/water/assignments/${assignment.id}`)}>
      {/* Overdue alert ribbon */}
      {isOverdue && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          backgroundColor: '#ef4444',
          color: '#ffffff',
          fontSize: '0.65rem',
          fontWeight: '800',
          padding: '0.2rem 0.6rem',
          borderBottomLeftRadius: '8px'
        }}>
          OVERDUE
        </div>
      )}

      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--water-text-muted)', textTransform: 'uppercase' }}>
            {assignment.assignment_number}
          </span>
          <h4 style={{ margin: '0.15rem 0 0', fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-text)' }}>
            Complaint #{assignment.complaint?.complaint_number || assignment.complaint_id}
          </h4>
        </div>
        <AssignmentStatusBadge status={assignment.status} />
      </div>

      <p style={{
        fontSize: '0.82rem',
        color: 'var(--water-text-muted)',
        margin: 0,
        lineHeight: '1.4',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {assignment.complaint?.description || 'No description provided.'}
      </p>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />

      {/* Details Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
        <div>
          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--water-text-muted)' }}>Assigned Worker</span>
          <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>
            {assignment.worker ? `${assignment.worker.first_name} ${assignment.worker.last_name}` : 'Unassigned'}
          </span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--water-text-muted)' }}>Priority</span>
          <span style={{ fontWeight: '800', color: getPriorityColor(assignment.priority) }}>
            {assignment.priority}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
        <div>
          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--water-text-muted)' }}>Deadline</span>
          <span style={{ fontWeight: '600', color: isOverdue ? '#ef4444' : 'var(--water-text)' }}>
            {new Date(assignment.deadline).toLocaleDateString()}
          </span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--water-text-muted)' }}>Ward/Area</span>
          <span style={{ fontWeight: '600', color: 'var(--water-text)' }}>
            {assignment.complaint?.ward || 'Ward-3'} / {assignment.complaint?.area || 'Area'}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/water/assignments/${assignment.id}`);
          }}
          className="water-btn"
          style={{
            width: '100%',
            padding: '0.45rem',
            fontSize: '0.78rem',
            fontWeight: '700',
            borderColor: 'var(--water-primary-light)',
            color: 'var(--water-primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem',
            backgroundColor: '#ffffff'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>settings</span>
          Manage Assignment
        </button>
      </div>
    </div>
  );
}
