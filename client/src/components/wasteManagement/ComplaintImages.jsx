import React from 'react';

export default function ComplaintImages({ beforeImage, afterImage }) {
  const placeholder = "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=600";

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', margin: 0 }}>
        <span className="material-symbols-outlined" style={{ color: '#059669' }}>photo_library</span>
        Before & After Operational Photos
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem'
      }}>
        {/* Before Image */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>
            Before (Citizen Report Upload)
          </span>
          <div style={{
            height: '200px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            position: 'relative',
            backgroundColor: '#f8fafc'
          }}>
            <img 
              src={beforeImage || placeholder} 
              alt="Citizen Report Photo" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: beforeImage ? 1 : 0.4
              }}
            />
            {!beforeImage && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.3rem',
                color: '#64748b'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.2rem' }}>
                  image_not_supported
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: '600' }}>No Photo Uploaded</span>
              </div>
            )}
          </div>
        </div>

        {/* After Image */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>
            After (Field Sanitation Resolution)
          </span>
          <div style={{
            height: '200px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            position: 'relative',
            backgroundColor: '#f8fafc'
          }}>
            <img 
              src={afterImage || placeholder} 
              alt="Field Resolution Photo" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: afterImage ? 1 : 0.4
              }}
            />
            {!afterImage && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.3rem',
                color: '#64748b'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.2rem' }}>
                  pending_actions
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: '600' }}>No Resolution Photo</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
