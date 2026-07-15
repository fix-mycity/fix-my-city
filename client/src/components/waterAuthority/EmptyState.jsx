import React from 'react';

export default function EmptyState({ message, onReset }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      backgroundColor: '#ffffff',
      border: '1px dashed var(--water-border)',
      borderRadius: 'var(--water-radius)',
      textAlign: 'center',
      gap: '1rem',
      margin: '2rem 0'
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: 'var(--water-text-muted)', opacity: 0.5 }}>
        inbox
      </span>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--water-text)' }}>
        No Complaints Found
      </h3>
      <p style={{ fontSize: '0.88rem', color: 'var(--water-text-muted)', maxWidth: '400px', lineHeight: '1.5' }}>
        {message || "We couldn't find any complaints matching your search or filters. Try adjusting your parameters."}
      </p>
      {onReset && (
        <button 
          onClick={onReset} 
          className="water-btn water-btn-primary"
          style={{ marginTop: '0.5rem' }}
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}
