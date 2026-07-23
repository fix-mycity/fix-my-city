import React, { useState } from 'react';

export default function PhotoUpload({ onUpload }) {
  const [url, setUrl] = useState('');
  const [type, setType] = useState('BEFORE');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) {
      alert("Please provide a photo image URL.");
      return;
    }
    onUpload({
      photo_type: type,
      image_url: url
    });
    setUrl('');
  };

  return (
    <form onSubmit={handleSubmit} className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
      <h3 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--water-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Record Visual Evidence
      </h3>
      
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value)}
          className="water-input"
          style={{ width: '100px', padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
        >
          <option value="BEFORE">BEFORE</option>
          <option value="DURING">DURING</option>
          <option value="AFTER">AFTER</option>
        </select>

        <input 
          type="text" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste photo image URL..."
          className="water-input"
          style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
        />

        <button 
          type="submit" 
          className="water-btn"
          style={{
            backgroundColor: 'var(--water-primary)',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.8rem',
            padding: '0.35rem 0.75rem'
          }}
        >
          Upload URL
        </button>
      </div>
    </form>
  );
}
