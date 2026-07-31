import React, { useState } from 'react';

export default function PhotoGallery({ photos = [] }) {
  const [activeType, setActiveType] = useState('BEFORE');

  const filteredPhotos = photos.filter(p => p.photo_type === activeType);

  return (
    <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-primary)', margin: 0 }}>
          Visual Phase Records
        </h3>
        
        {/* Toggle tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--water-bg-light)', padding: '2px', borderRadius: '6px' }}>
          {['BEFORE', 'DURING', 'AFTER'].map(t => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              style={{
                border: 'none',
                background: activeType === t ? '#ffffff' : 'none',
                color: activeType === t ? 'var(--water-primary)' : 'var(--water-text-muted)',
                padding: '0.25rem 0.6rem',
                fontSize: '0.72rem',
                fontWeight: '700',
                borderRadius: '4px',
                cursor: 'pointer',
                boxShadow: activeType === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filteredPhotos.length === 0 ? (
        <div style={{
          padding: '2.5rem',
          textAlign: 'center',
          color: 'var(--water-text-muted)',
          fontSize: '0.8rem',
          backgroundColor: 'var(--water-bg-light)',
          borderRadius: '6px',
          border: '1px dashed var(--water-border)'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.25rem' }}>
            photo_camera
          </span>
          No photos uploaded for phase {activeType}.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '0.75rem'
        }}>
          {filteredPhotos.map(p => (
            <div key={p.id} style={{
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px solid var(--water-border)',
              backgroundColor: 'var(--water-bg-light)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <img 
                src={p.image_url} 
                alt={p.photo_type} 
                style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542013936693-8848e5744211?q=80&w=400'; }}
              />
              <span style={{ fontSize: '0.65rem', color: 'var(--water-text-muted)', padding: '0.35rem', textAlign: 'center' }}>
                Uploaded: {new Date(p.uploaded_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
