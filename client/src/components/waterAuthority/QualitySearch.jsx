import React, { useState } from 'react';

export default function QualitySearch({ value, onSearch }) {
  const [query, setQuery] = useState(value || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%', gap: '0.5rem' }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <span className="material-symbols-outlined" style={{
          position: 'absolute',
          left: '0.75rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--water-text-muted)',
          fontSize: '1.2rem',
          pointerEvents: 'none'
        }}>
          search
        </span>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by Report Number, Ward, Area, Laboratory, Inspector..."
          className="water-input"
          style={{ paddingLeft: '2.5rem' }}
        />
        {query && (
          <button 
            type="button"
            onClick={() => { setQuery(''); onSearch(''); }}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--water-text-muted)'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>close</span>
          </button>
        )}
      </div>
      <button 
        type="submit" 
        className="water-btn"
        style={{ backgroundColor: 'var(--water-primary)', color: '#ffffff', border: 'none', fontWeight: '700' }}
      >
        Search
      </button>
    </form>
  );
}
