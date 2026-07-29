import React from 'react';

export default function QuickActions({
  onAddComplaint,
  onAddBin,
  onAddVehicle,
  onCreateSchedule,
  onAddWorker
}) {
  const actions = [
    { label: 'Add Complaint', icon: 'report_problem', onClick: onAddComplaint, color: '#ef4444', bg: '#fef2f2' },
    { label: 'Add Waste Bin', icon: 'delete', onClick: onAddBin, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Add Vehicle', icon: 'local_shipping', onClick: onAddVehicle, color: '#06b6d4', bg: '#ecfeff' },
    { label: 'Create Schedule', icon: 'route', onClick: onCreateSchedule, color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Add Worker', icon: 'person_add', onClick: onAddWorker, color: '#f59e0b', bg: '#fffbeb' }
  ];

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '1.25rem',
      marginBottom: '1.75rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
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
        <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: '20px' }}>bolt</span>
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
            onClick={act.onClick}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: act.bg,
              color: act.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                {act.icon}
              </span>
            </div>
            <span style={{
              fontSize: '0.875rem',
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
