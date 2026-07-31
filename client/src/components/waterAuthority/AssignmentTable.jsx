import React from 'react';
import { useNavigate } from 'react-router-dom';
import AssignmentStatusBadge from './AssignmentStatusBadge';

export default function AssignmentTable({ assignments = [] }) {
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
            <th style={{ padding: '0.95rem 1rem', fontWeight: '700', color: 'var(--water-text)' }}>Assignment Number</th>
            <th style={{ padding: '0.95rem 1rem', fontWeight: '700', color: 'var(--water-text)' }}>Complaint ID</th>
            <th style={{ padding: '0.95rem 1rem', fontWeight: '700', color: 'var(--water-text)' }}>Worker</th>
            <th style={{ padding: '0.95rem 1rem', fontWeight: '700', color: 'var(--water-text)' }}>Ward</th>
            <th style={{ padding: '0.95rem 1rem', fontWeight: '700', color: 'var(--water-text)' }}>Area</th>
            <th style={{ padding: '0.95rem 1rem', fontWeight: '700', color: 'var(--water-text)' }}>Priority</th>
            <th style={{ padding: '0.95rem 1rem', fontWeight: '700', color: 'var(--water-text)' }}>Deadline</th>
            <th style={{ padding: '0.95rem 1rem', fontWeight: '700', color: 'var(--water-text)' }}>Status</th>
            <th style={{ padding: '0.95rem 1rem', fontWeight: '700', color: 'var(--water-text)' }}>Assigned Date</th>
            <th style={{ padding: '0.95rem 1rem', fontWeight: '700', color: 'var(--water-text)', textAlign: 'center' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {assignments.length === 0 ? (
            <tr>
              <td colSpan={10} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--water-text-muted)', fontSize: '0.9rem' }}>
                No active work assignments found matching criteria.
              </td>
            </tr>
          ) : (
            assignments.map((item) => (
              <tr key={item.id} style={{
                borderBottom: '1px solid #f1f5f9',
                transition: 'background-color 0.15s ease',
                cursor: 'pointer'
              }} onClick={() => navigate(`/water/assignments/${item.id}`)}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: 'var(--water-primary-light)' }}>
                  {item.assignment_number}
                </td>
                <td style={{ padding: '0.85rem 1rem', fontWeight: '600' }}>
                  #{item.complaint_id} ({item.complaint?.complaint_number || 'N/A'})
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  {item.worker ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600', color: 'var(--water-text)' }}>
                        {item.worker.first_name} {item.worker.last_name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>
                        {item.worker.designation || 'Field Staff'}
                      </span>
                    </div>
                  ) : 'Unassigned'}
                </td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--water-text)' }}>
                  {item.complaint?.ward || 'N/A'}
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
                    <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>
                      {item.priority === 'CRITICAL' ? 'warning' : 'circle'}
                    </span>
                    {item.priority}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--water-text)' }}>
                  {new Date(item.deadline).toLocaleString()}
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <AssignmentStatusBadge status={item.status} />
                </td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--water-text-muted)', fontSize: '0.8rem' }}>
                  {new Date(item.assigned_date).toLocaleDateString()}
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/water/assignments/${item.id}`)}
                    className="water-btn"
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.78rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      borderColor: 'var(--water-primary-light)',
                      color: 'var(--water-primary-light)',
                      fontWeight: '700'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>visibility</span>
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
