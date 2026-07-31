import React, { useState } from 'react';

export default function UploadProof({ label = "Upload Image Proof", onUpload, existingImage }) {
  const [preview, setPreview] = useState(existingImage || null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size and type
    if (!file.type.startsWith('image/')) {
      alert("Please select a valid image file.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setPreview(base64String);
      onUpload(base64String);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setPreview(null);
    onUpload(null);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      backgroundColor: '#f8fafc',
      border: '1.5px dashed var(--water-border)',
      borderRadius: '12px',
      padding: '1rem',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '120px',
      position: 'relative'
    }}>
      <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--water-text)', display: 'block', alignSelf: 'flex-start' }}>
        {label}
      </span>

      {preview ? (
        <div style={{ position: 'relative', width: '100%', maxWidth: '180px', margin: '0.5rem 0' }}>
          <img 
            src={preview} 
            alt="Upload Preview" 
            style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--water-border)' }} 
          />
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '0.85rem' }}>close</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', margin: '0.5rem 0' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--water-text-muted)' }}>
            add_a_photo
          </span>
          <label style={{
            fontSize: '0.78rem',
            color: 'var(--water-primary-light)',
            fontWeight: '700',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}>
            Browse files
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
          </label>
          <span style={{ fontSize: '0.65rem', color: 'var(--water-text-muted)' }}>
            PNG, JPG, or GIF up to 5MB
          </span>
        </div>
      )}

      {uploading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(255,255,255,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px'
        }}>
          <span className="material-symbols-outlined animate-spin" style={{ color: 'var(--water-primary-light)' }}>
            sync
          </span>
        </div>
      )}
    </div>
  );
}
