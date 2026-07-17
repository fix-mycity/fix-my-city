import React from 'react';

export default function ComplaintImages({ beforeImage, afterImage }) {
  const placeholder = "https://images.unsplash.com/photo-1584267385494-9fcd97616ee1?auto=format&fit=crop&q=80&w=300";

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid var(--water-border)',
      borderRadius: 'var(--water-radius)',
      padding: '1.5rem',
      boxShadow: 'var(--water-shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--water-text)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.75rem' }}>
        <span className="material-symbols-outlined" style={{ color: 'var(--water-primary-light)' }}>image</span>
        Operational Images Comparisons
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem'
      }}>
        {/* Before Image */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>
            Before (Citizen Report Upload)
          </span>
          <div style={{
            height: '200px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid var(--water-border)',
            position: 'relative',
            backgroundColor: 'var(--water-bg)'
          }}>
            <img 
              src={beforeImage || placeholder} 
              alt="Leakage before work" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: beforeImage ? 1 : 0.4
              }}
            />
            {!beforeImage && (
              <span className="material-symbols-outlined" style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '2rem',
                color: 'var(--water-text-muted)'
              }}>
                image_not_supported
              </span>
            )}
          </div>
        </div>

        {/* After Image */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>
            After (Field Worker Resolution)
          </span>
          <div style={{
            height: '200px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid var(--water-border)',
            position: 'relative',
            backgroundColor: 'var(--water-bg)'
          }}>
            <img 
              src={afterImage || placeholder} 
              alt="Resolved pipeline fix" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: afterImage ? 1 : 0.4
              }}
            />
            {!afterImage && (
              <span className="material-symbols-outlined" style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '2rem',
                color: 'var(--water-text-muted)'
              }}>
                pending_actions
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
