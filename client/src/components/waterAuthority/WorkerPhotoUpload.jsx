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
    <div className="premium-field-group full-width" style={{ marginBottom: '0.5rem' }}>
      <label className="premium-label">Worker Profile Photo</label>
      <div className="premium-photo-upload-container">
        <div className="premium-avatar-preview">
          {preview ? (
            <img src={preview} alt="Worker Preview" />
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--water-text-muted)' }}>
              person
            </span>
          )}
        </div>
        <div className="premium-photo-controls">
          <label className="premium-photo-upload-btn">
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>upload_file</span>
            Choose Photo
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
          {preview && (
            <button 
              type="button" 
              onClick={handleClear}
              className="premium-photo-remove-btn"
            >
              Remove Photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
