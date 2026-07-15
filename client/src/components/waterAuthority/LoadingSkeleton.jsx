import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div className="water-skeleton-container">
      {/* Header skeleton */}
      <div className="water-page-header">
        <div className="water-page-header-title">
          <div className="water-skeleton-pulse water-skeleton-header" style={{ height: '32px', width: '280px' }} />
          <div className="water-skeleton-pulse water-skeleton-header" style={{ height: '18px', width: '180px', marginTop: '8px' }} />
        </div>
        <div className="water-skeleton-pulse" style={{ height: '40px', width: '140px', borderRadius: '8px' }} />
      </div>

      {/* Cards skeleton */}
      <div className="water-skeleton-cards-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="water-skeleton-pulse water-skeleton-card" />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="water-skeleton-charts-grid">
        <div className="water-skeleton-pulse water-skeleton-chart" />
        <div className="water-skeleton-pulse water-skeleton-chart" />
      </div>
    </div>
  );
}
