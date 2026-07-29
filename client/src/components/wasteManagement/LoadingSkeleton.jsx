import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
      <div style={{ height: '70px', backgroundColor: '#e2e8f0', borderRadius: '12px', opacity: 0.6 }}></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} style={{ height: '110px', backgroundColor: '#e2e8f0', borderRadius: '12px', opacity: 0.6 }}></div>
        ))}
      </div>
      <div style={{ height: '240px', backgroundColor: '#e2e8f0', borderRadius: '12px', opacity: 0.6 }}></div>
    </div>
  );
}
