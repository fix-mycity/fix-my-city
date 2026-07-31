import React from 'react';

export default function PipelineTimeline({ pipeline, inspections = [], maintenances = [] }) {
  // Build dynamic timeline events
  const events = [];

  // 1. Installation
  if (pipeline.installation_date) {
    events.push({
      date: new Date(pipeline.installation_date),
      dateStr: pipeline.installation_date,
      type: 'INSTALLATION',
      title: 'Pipeline Installed',
      description: `Material: ${pipeline.material} | Diameter: ${pipeline.diameter || 'N/A'}mm | Length: ${pipeline.length || 'N/A'}m. Source: ${pipeline.water_source || 'N/A'}`,
      icon: 'construction',
      color: 'var(--water-primary-light)'
    });
  }

  // 2. Inspections & Leaks
  inspections.forEach(ins => {
    events.push({
      date: new Date(ins.inspection_date),
      dateStr: ins.inspection_date,
      type: 'INSPECTION',
      title: `Inspection: ${ins.condition}`,
      description: `Conducted by ${ins.inspector_name}. Pressure: ${ins.pressure_level !== null ? ins.pressure_level + ' psi' : 'N/A'}. Remarks: ${ins.remarks || 'None'}`,
      icon: 'fact_check',
      color: ins.condition === 'CRITICAL' || ins.condition === 'POOR' ? 'var(--water-danger)' : 'var(--water-success)'
    });

    if (ins.leak_detected) {
      events.push({
        date: new Date(ins.inspection_date),
        dateStr: ins.inspection_date,
        type: 'LEAK',
        title: 'Leak Detected',
        description: `Leak flagged by inspector ${ins.inspector_name}. Pipeline state moved to DAMAGED.`,
        icon: 'warning',
        color: 'var(--water-danger)'
      });
    }
  });

  // 3. Maintenances
  maintenances.forEach(m => {
    events.push({
      date: new Date(m.start_date),
      dateStr: m.start_date,
      type: 'MAINTENANCE_START',
      title: `Maintenance: ${m.maintenance_type}`,
      description: `Task scheduled for assigned worker: ${m.assigned_worker || 'Unassigned'}. Reason: ${m.reason || 'Routine'}. Current status: ${m.status}`,
      icon: 'build',
      color: 'var(--water-warning)'
    });

    if (m.status === 'COMPLETED' && m.end_date) {
      events.push({
        date: new Date(m.end_date),
        dateStr: m.end_date,
        type: 'MAINTENANCE_END',
        title: 'Maintenance Completed',
        description: `Repair work finished. Remarks: ${m.remarks || 'None'}. Pipeline operational status returned to ACTIVE.`,
        icon: 'task_alt',
        color: 'var(--water-success)'
      });
    }
  });

  // Sort events chronologically (newest first for timeline flow, or oldest first. Let's do newest first so latest info is at the top)
  events.sort((a, b) => b.date - a.date);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
        Pipeline Lifecycle History
      </h3>

      {events.length === 0 ? (
        <p style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
          No lifecycle events recorded.
        </p>
      ) : (
        <div style={{
          position: 'relative',
          paddingLeft: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          marginTop: '0.5rem'
        }}>
          {/* Vertical line indicator */}
          <div style={{
            position: 'absolute',
            left: '9px',
            top: '8px',
            bottom: '8px',
            width: '2px',
            backgroundColor: 'var(--water-border)'
          }} />

          {events.map((ev, index) => (
            <div key={index} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              
              {/* Event node dot */}
              <div style={{
                position: 'absolute',
                left: '-2rem',
                top: '2px',
                width: '20px',
                height: '20px',
                borderRadius: '50px',
                backgroundColor: '#ffffff',
                border: `2px solid ${ev.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: ev.color,
                zIndex: 2
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '0.75rem', fontWeight: '800' }}>
                  {ev.icon}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--water-text)' }}>
                  {ev.title}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)', fontWeight: '700' }}>
                  {ev.dateStr}
                </span>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--water-text-muted)', margin: 0, lineHeight: '1.4' }}>
                {ev.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
