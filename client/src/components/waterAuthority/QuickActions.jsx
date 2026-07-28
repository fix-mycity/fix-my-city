import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    { label: 'Add Worker', icon: 'person_add', path: '/water/workers', color: '#2563eb', bg: '#eff6ff' },
    { label: 'Add Water Schedule', icon: 'schedule', path: '/water/supply', color: '#7c3aed', bg: '#f3e8ff' },
    { label: 'Create Notification', icon: 'campaign', path: '/water/notifications', color: '#ea580c', bg: '#fff7ed' },
    { label: 'View Complaints', icon: 'rate_review', path: '/water/complaints', color: '#dc2626', bg: '#fef2f2' },
    { label: 'Generate Report', icon: 'description', path: '/water/reports', color: '#16a34a', bg: '#f0fdf4' }
  ];

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '1.25rem',
      marginBottom: '1.25rem',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
    }}>
      <h3 style={{
        fontSize: '0.95rem',
        fontWeight: '700',
        color: '#0f172a',
        margin: '0 0 1rem 0',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem'
      }}>
        <span className="material-symbols-outlined" style={{ color: '#2563eb', fontSize: '20px' }}>bolt</span>
        Quick Administrative Actions
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.85rem'
      }}>
        {actions.map((act, index) => (
          <button 
            key={index} 
            onClick={() => navigate(act.path)}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              backgroundColor: act.bg,
              color: act.color,
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              flexShrink: 0
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {act.icon}
              </span>
            </div>
            <span style={{
              fontSize: '0.82rem',
              fontWeight: '700',
              color: '#0f172a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {act.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
