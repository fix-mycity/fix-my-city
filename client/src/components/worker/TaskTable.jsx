import React from 'react';
import { useNavigate } from 'react-router-dom';
import AssignmentStatusBadge from '../waterAuthority/AssignmentStatusBadge';

export default function TaskTable({ tasks = [] }) {
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
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid var(--water-border)',
      borderRadius: '12px',
      boxShadow: 'var(--water-shadow-sm)',
      overflowX: 'auto'
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
        fontSize: '0.85rem'
      }}>
        <thead>
          <tr style={{
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid var(--water-border)'
          }}>
            <th style={{ padding: '0.95rem 1rem', fontWeight: '700', color: 'var(--water-text)' }}>Task Number</th>
            <th style={{ padding: '0.95rem 1rem', fontWeight: '700', color: 'var(--water-text)' }}>Complaint</th>
            <th style={{ padding: '0.95rem 1rem', fontWeight: '700', color: 'var(--water-text)' }}>Area</th>
            <th style={{ padding: '0.95rem 1rem', fontWeight: '700', color: 'var(--water-text)' }}>Priority</th>
            <th style={{ padding: '0.95rem 1rem', fontWeight: '700', color: 'var(--water-text)' }}>Deadline</th>
            <th style={{ padding: '0.95rem 1rem', fontWeight: '700', color: 'var(--water-text)' }}>Status</th>
            <th style={{ padding: '0.95rem 1rem', fontWeight: '700', color: 'var(--water-text)', textAlign: 'center' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--water-text-muted)', fontSize: '0.9rem' }}>
                No tasks assigned to you.
              </td>
            </tr>
          ) : (
            tasks.map((item) => (
              <tr key={item.id} style={{
                borderBottom: '1px solid #f1f5f9',
                transition: 'background-color 0.15s ease',
                cursor: 'pointer'
              }} onClick={() => navigate(`/worker/tasks/${item.id}`)}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: 'var(--water-primary-light)' }}>
                  {item.assignment_number}
                </td>
                <td style={{ padding: '0.85rem 1rem', fontWeight: '600' }}>
                  #{item.complaint_id} - {item.complaint?.title || 'Leak Repair'}
                </td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--water-text)' }}>
                  {item.complaint?.area || 'N/A'}
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: getPriorityColor(item.priority),
                    fontWeight: '700',
                    fontSize: '0.8rem'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>circle</span>
                    {item.priority}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--water-text)' }}>
                  {new Date(item.deadline).toLocaleString()}
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <AssignmentStatusBadge status={item.status} />
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/worker/tasks/${item.id}`)}
                    className="water-btn water-btn-primary"
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.78rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontWeight: '700'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>play_circle</span>
                    Details
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
