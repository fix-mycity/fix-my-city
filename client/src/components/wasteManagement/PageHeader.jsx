import React from 'react';

export default function PageHeader({ title, subtitle, onActionClick, actionLabel, actionIcon, isLoading }) {
  const defaultIcon = actionLabel && (
    actionLabel.toLowerCase().includes('add') || 
    actionLabel.toLowerCase().includes('register') || 
    actionLabel.toLowerCase().includes('create') || 
    actionLabel.toLowerCase().includes('new')
  ) ? 'add' : 'refresh';

  return (
    <div className="waste-page-header">
      <div>
        <h1 className="waste-page-title">{title}</h1>
        <div className="waste-page-subtitle">{subtitle}</div>
      </div>

      {onActionClick && (
        <button
          onClick={onActionClick}
          disabled={isLoading}
          className="waste-btn waste-btn-primary"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            {isLoading ? 'sync' : (actionIcon || defaultIcon)}
          </span>
          {actionLabel || 'Sync Live Data'}
        </button>
      )}
    </div>
  );
}
