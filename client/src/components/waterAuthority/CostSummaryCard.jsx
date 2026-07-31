import React from 'react';

export default function CostSummaryCard({ estimated = 0, actual = 0 }) {
  const estVal = parseFloat(estimated) || 0;
  const actVal = parseFloat(actual) || 0;

  const diff = estVal - actVal;
  const isOverBudget = diff < 0;

  const getPercent = () => {
    if (estVal === 0) return actVal > 0 ? 100 : 0;
    return Math.min((actVal / estVal) * 100, 100);
  };

  const getTrackColor = () => {
    if (isOverBudget) return '#e74c3c';
    if (getPercent() > 90) return '#f39c12';
    return 'var(--water-success)';
  };

  return (
    <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
        Cost & Budget Summary
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--water-text-muted)', textTransform: 'uppercase' }}>
            Estimated Budget
          </span>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--water-text)' }}>
            ${estVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--water-text-muted)', textTransform: 'uppercase' }}>
            Actual Spent
          </span>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', color: isOverBudget ? '#c0392b' : 'var(--water-text)' }}>
            ${actVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Progress track */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--water-bg-light)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            width: `${getPercent()}%`,
            height: '100%',
            backgroundColor: getTrackColor(),
            borderRadius: '4px',
            transition: 'width 0.8s ease-out'
          }} />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--water-text-muted)' }}>
          <span>Budget Utilisation</span>
          <span>{getPercent().toFixed(0)}%</span>
        </div>
      </div>

      <div style={{
        marginTop: '0.5rem',
        padding: '0.5rem 0.75rem',
        borderRadius: '6px',
        backgroundColor: isOverBudget ? 'rgba(231, 76, 60, 0.08)' : 'rgba(46, 204, 113, 0.08)',
        border: isOverBudget ? '1px solid rgba(231, 76, 60, 0.2)' : '1px solid rgba(46, 204, 113, 0.2)',
        fontSize: '0.78rem',
        fontWeight: '700',
        color: isOverBudget ? '#c0392b' : 'var(--water-success)'
      }}>
        {isOverBudget ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>warning</span>
            Over Budget by ${Math.abs(diff).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>check_circle</span>
            Under Budget. Remaining: ${diff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        )}
      </div>
    </div>
  );
}
