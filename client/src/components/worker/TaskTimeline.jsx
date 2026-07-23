import React from 'react';
import AssignmentTimeline from '../waterAuthority/AssignmentTimeline';

export default function TaskTimeline({ updates = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-text)' }}>
        Progress timeline logs
      </h4>
      <AssignmentTimeline updates={updates} />
    </div>
  );
}
