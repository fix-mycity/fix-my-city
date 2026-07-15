import React from 'react';

export default function PageHeader({ title, subtitle, onActionClick, actionLabel, isLoading }) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="water-page-header">
      <div className="water-page-header-title">
        <h1>{title}</h1>
        <p>{subtitle} • {currentDate}</p>
      </div>
      <div className="water-quick-actions-row">
        <button 
          onClick={onActionClick} 
          className="water-btn water-btn-primary"
          disabled={isLoading}
        >
          <span className="material-symbols-outlined">
            {isLoading ? 'autorenew' : 'sync'}
          </span>
          {isLoading ? 'Refreshing...' : actionLabel || 'Refresh Data'}
        </button>
      </div>
    </div>
  );
}
