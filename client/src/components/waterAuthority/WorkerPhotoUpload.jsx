import React, { useState } from 'react';

export default function WorkerPhotoUpload({ currentPhoto, onChange }) {
  const [preview, setPreview] = useState(currentPhoto || '');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPreview(base64String);
        onChange(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    setPreview('');
    onChange('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text-muted)' }}>Worker Profile Photo</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          border: '2px dashed var(--water-border)',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {preview ? (
            <img src={preview} alt="Worker Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--water-text-muted)' }}>
              person
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="water-btn" style={{
            padding: '0.5rem 1rem',
            border: '1px solid var(--water-primary-light)',
            color: 'var(--water-primary-light)',
            fontSize: '0.8rem',
            fontWeight: '600',
            cursor: 'pointer',
            borderRadius: '6px',
            textAlign: 'center',
            display: 'inline-block'
          }}>
            Choose File
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
          {preview && (
            <button 
              type="button" 
              onClick={handleClear}
              className="water-btn"
              style={{
                padding: '0.4rem 0.8rem',
                border: '1px solid var(--water-danger)',
                color: 'var(--water-danger)',
                fontSize: '0.75rem',
                fontWeight: '600',
                borderRadius: '6px'
              }}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
