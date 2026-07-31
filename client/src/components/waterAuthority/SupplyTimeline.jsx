import React from 'react';

export default function SupplyTimeline({ schedule }) {
  if (!schedule) return null;

  const events = [];

  // Add creation event
  if (schedule.created_at) {
    events.push({
      title: 'Schedule Created',
      description: `Schedule number ${schedule.schedule_number} was initialized in system.`,
      time: new Date(schedule.created_at).toLocaleString(),
      icon: 'add_circle',
      color: 'var(--water-primary-light)'
    });
  }

  // Add morning slot event
  if (schedule.morning_start_time && schedule.morning_end_time) {
    events.push({
      title: 'Morning Supply Window',
      description: `Morning water distribution scheduled. Duration: ${schedule.morning_start_time} to ${schedule.morning_end_time}.`,
      time: schedule.supply_date,
      icon: 'wb_sunny',
      color: 'var(--water-info)'
    });
  }

  // Add evening slot event
  if (schedule.evening_start_time && schedule.evening_end_time) {
    events.push({
      title: 'Evening Supply Window',
      description: `Evening water distribution scheduled. Duration: ${schedule.evening_start_time} to ${schedule.evening_end_time}.`,
      time: schedule.supply_date,
      icon: 'nights_stay',
      color: '#1e3a8a'
    });
  }

  // Add current status update event
  let statusIcon = 'schedule';
  let statusColor = 'var(--water-primary)';
  if (schedule.status === 'ACTIVE') {
    statusIcon = 'radio_button_checked';
    statusColor = 'var(--water-success)';
  } else if (schedule.status === 'PAUSED') {
    statusIcon = 'pause_circle';
    statusColor = 'var(--water-warning)';
  } else if (schedule.status === 'COMPLETED') {
    statusIcon = 'check_circle';
    statusColor = 'var(--water-info)';
  } else if (schedule.status === 'CANCELLED') {
    statusIcon = 'dangerous';
    statusColor = 'var(--water-danger)';
  }

  events.push({
    title: `Status: ${schedule.status}`,
    description: schedule.remarks || `Current operations are set to ${schedule.status.toLowerCase()}.`,
    time: new Date(schedule.updated_at || schedule.created_at).toLocaleString(),
    icon: statusIcon,
    color: statusColor
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--water-text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: 'var(--water-primary-light)' }}>timeline</span>
        Supply Timeline & Operations History
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--water-border)', gap: '1.5rem', marginLeft: '0.5rem' }}>
        {events.map((evt, idx) => (
          <div key={idx} style={{ position: 'relative' }}>
            {/* Timeline Dot */}
            <div style={{
              position: 'absolute',
              left: '-2.15rem',
              top: '0px',
              backgroundColor: '#ffffff',
              color: evt.color,
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${evt.color}`,
              boxShadow: 'var(--water-shadow-sm)',
              zIndex: 2
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem', fontWeight: 'bold' }}>{evt.icon}</span>
            </div>

            {/* Timeline Content */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--water-border)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              boxShadow: 'var(--water-shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--water-text)' }}>{evt.title}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--water-text-muted)', fontWeight: '600' }}>{evt.time}</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--water-text-muted)', margin: 0 }}>{evt.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
