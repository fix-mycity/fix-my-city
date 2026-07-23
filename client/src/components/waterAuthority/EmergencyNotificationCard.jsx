import React, { useState } from 'react';

export default function EmergencyNotificationCard({ notifications = [], onSendNotification }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert("Notification title and message are required.");
      return;
    }
    onSendNotification({
      notification_title: title,
      notification_message: message
    });
    setTitle('');
    setMessage('');
  };

  return (
    <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
        Dispatch Citizen Emergency Alerts
      </h3>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <label className="water-label" style={{ fontSize: '0.75rem' }}>Alert Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. EMERGENCY WATER SHUTDOWN - Ward 12" 
            className="water-input"
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
          />
        </div>

        <div>
          <label className="water-label" style={{ fontSize: '0.75rem' }}>Broadcast Message</label>
          <textarea 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write alert content detailing timeline and restoration..." 
            className="water-input"
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', height: '60px', fontFamily: 'inherit' }}
          />
        </div>

        <button 
          type="submit" 
          className="water-btn"
          style={{
            backgroundColor: '#f39c12',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.8rem',
            padding: '0.4rem 0.8rem',
            fontWeight: '700',
            alignSelf: 'flex-end',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>broadcast_on_personal</span>
          Broadcast Alert
        </button>
      </form>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
        <h4 style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: 0, letterSpacing: '0.5px' }}>
          Sent Alerts Log ({notifications.length})
        </h4>
        
        {notifications.length === 0 ? (
          <div style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)', padding: '0.5rem', textAlign: 'center', fontStyle: 'italic' }}>
            No broadcasts issued yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
            {notifications.map((n, idx) => (
              <div key={n.id || idx} style={{
                padding: '0.5rem',
                border: '1px solid var(--water-border)',
                borderRadius: '6px',
                backgroundColor: 'rgba(243, 156, 18, 0.04)',
                fontSize: '0.75rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: 'var(--water-text)' }}>
                  <span>{n.notification_title}</span>
                  <span style={{ color: 'var(--water-success)' }}>{n.notification_status}</span>
                </div>
                <p style={{ margin: '0.2rem 0', color: 'var(--water-text-muted)' }}>{n.notification_message}</p>
                {n.sent_at && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--water-text-muted)' }}>
                    Sent: {new Date(n.sent_at).toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
