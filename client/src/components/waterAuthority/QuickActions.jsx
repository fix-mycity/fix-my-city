import React from 'react';
import { toast } from 'react-hot-toast';

export default function QuickActions() {
  const actions = [
    { label: 'Add Worker', icon: 'person_add', color: 'blue' },
    { label: 'Add Water Schedule', icon: 'schedule', color: 'indigo' },
    { label: 'Create Notification', icon: 'campaign', color: 'orange' },
    { label: 'View Complaints', icon: 'rate_review', color: 'red' },
    { label: 'Generate Report', icon: 'file_save', color: 'green' }
  ];

  const handleActionClick = (label) => {
    toast.success(`Action Triggered: ${label} (Phase 1 Demo)`);
  };

  return (
    <div className="water-quick-actions-panel">
      <h3 className="water-panel-title">
        <span className="material-symbols-outlined">bolt</span>
        Quick Administrative Actions
      </h3>
      <div className="water-quick-action-buttons">
        {actions.map((act, index) => (
          <button 
            key={index} 
            className="water-quick-action-btn"
            onClick={() => handleActionClick(act.label)}
          >
            <span className="material-symbols-outlined" style={{ color: `var(--water-primary-light)` }}>
              {act.icon}
            </span>
            <span className="water-quick-action-btn-text">{act.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
