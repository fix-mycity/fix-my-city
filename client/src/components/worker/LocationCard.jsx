import React, { useState } from 'react';

export default function LocationCard({ onLocationCapture, existingCoords }) {
  const [coords, setCoords] = useState(existingCoords || null);
  const [loading, setLoading] = useState(false);

  const getGeoLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const captured = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setCoords(captured);
        onLocationCapture(captured);
        setLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Failed to access your location. Please ensure location services are enabled.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid var(--water-border)',
      borderRadius: '12px',
      padding: '1rem',
      boxShadow: 'var(--water-shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }}>
      <h5 style={{ margin: 0, fontSize: '0.8rem', fontWeight: '800', color: 'var(--water-text)' }}>
        Field Location Capture
      </h5>

      {coords ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.6rem 0.8rem', borderRadius: '8px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#166534', display: 'block', fontWeight: '700' }}>GPS Coordinates Captured</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--water-text)' }}>
              Lat: {coords.latitude.toFixed(6)}, Long: {coords.longitude.toFixed(6)}
            </span>
          </div>
          <button
            type="button"
            onClick={getGeoLocation}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--water-primary-light)',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0
            }}
          >
            Recapture
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--water-text-muted)', maxWidth: '65%' }}>
            Capture your current location coordinates before submitting status updates.
          </p>
          <button
            type="button"
            onClick={getGeoLocation}
            disabled={loading}
            className="water-btn water-btn-primary"
            style={{
              padding: '0.45rem 0.9rem',
              fontSize: '0.78rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '0.95rem' }}>my_location</span>
            {loading ? 'Locating...' : 'Get GPS'}
          </button>
        </div>
      )}
    </div>
  );
}
