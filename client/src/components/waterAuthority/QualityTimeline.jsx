import React from 'react';

export default function QualityTimeline({ sampleDate, createdDate, overallStatus, hasAlerts }) {
  const steps = [
    {
      title: 'Sample Collected',
      date: sampleDate || 'N/A',
      description: 'Physical sample drawn from the designated municipal node.',
      icon: 'colorize',
      color: 'var(--water-primary-light)',
      done: true
    },
    {
      title: 'Laboratory Testing',
      date: sampleDate || 'N/A',
      description: 'Parameters analysed at the regional testing center.',
      icon: 'science',
      color: 'var(--water-primary)',
      done: true
    },
    {
      title: 'Report Generated',
      date: createdDate ? createdDate.substring(0, 10) : 'N/A',
      description: 'Chemical/biological results committed to municipal index.',
      icon: 'assignment',
      color: '#16a085',
      done: true
    },
    {
      title: 'Alert Analysis',
      date: createdDate ? createdDate.substring(0, 10) : 'N/A',
      description: hasAlerts ? 'Alert trigger thresholds reached. Alarm registered!' : 'All parameters are within acceptable safe ranges.',
      icon: hasAlerts ? 'notification_important' : 'notifications_off',
      color: hasAlerts ? '#e74c3c' : '#2ecc71',
      done: true
    },
    {
      title: 'Authority Reviewed',
      date: createdDate ? createdDate.substring(0, 10) : 'N/A',
      description: overallStatus === 'SAFE' ? 'Reviewed: Water certified as SAFE.' : 'Reviewed: WARNING/UNSAFE operational warnings flagged.',
      icon: 'verified_user',
      color: overallStatus === 'SAFE' ? '#27ae60' : '#e67e22',
      done: overallStatus !== 'UNDER_REVIEW'
    }
  ];

  return (
    <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
        Inspection Lifecycle
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}>
        {steps.map((evt, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '1rem', opacity: evt.done ? 1 : 0.5 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50px',
                backgroundColor: evt.done ? `${evt.color}15` : '#eee',
                color: evt.done ? evt.color : '#888',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                border: evt.done ? `2px solid ${evt.color}` : '2px solid #ccc'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>{evt.icon}</span>
              </div>
              {idx < steps.length - 1 && (
                <div style={{ width: '2px', flex: 1, backgroundColor: 'var(--water-border)', margin: '4px 0' }} />
              )}
            </div>
            <div style={{ flex: 1, paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <strong style={{ fontSize: '0.88rem', color: 'var(--water-text)' }}>{evt.title}</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--water-text-muted)', fontWeight: '700' }}>{evt.date}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--water-text-muted)', margin: '0.2rem 0 0 0' }}>
                {evt.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
