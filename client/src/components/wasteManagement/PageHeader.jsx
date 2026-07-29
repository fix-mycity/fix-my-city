import React from 'react';

export default function PageHeader({ title, subtitle, onActionClick, actionLabel, isLoading }) {
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
            {isLoading ? 'sync' : 'refresh'}
          </span>
          {actionLabel || 'Sync Live Data'}
        </button>
      )}
    </div>
  );
}
