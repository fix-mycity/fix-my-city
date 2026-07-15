import React, { useState } from 'react';

export default function WorkerSearch({ onSearch, placeholder }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      width: '100%',
      maxWidth: '480px',
      position: 'relative'
    }}>
      <span className="material-symbols-outlined" style={{
        position: 'absolute',
        left: '0.85rem',
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
        placeholder={placeholder || "Search employee ID, name, email, phone, ward..."}
        style={{
          width: '100%',
          padding: '0.6rem 2.5rem 0.6rem 2.4rem',
          borderRadius: '24px',
          border: '1px solid var(--water-border)',
          backgroundColor: '#ffffff',
          fontSize: '0.85rem',
          outline: 'none',
          boxShadow: 'var(--water-shadow-sm)',
          transition: 'all 0.2s ease-in-out'
        }}
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '4.8rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--water-text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Clear search"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>cancel</span>
        </button>
      )}
      <button
        type="submit"
        className="water-btn water-btn-primary"
        style={{
          borderRadius: '24px',
          padding: '0.55rem 1.25rem',
          fontSize: '0.8rem',
          flexShrink: 0
        }}
      >
        Search
      </button>
    </form>
  );
}
