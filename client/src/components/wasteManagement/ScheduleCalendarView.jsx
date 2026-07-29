import React, { useState, useEffect } from 'react';
import { getWasteScheduleCalendar } from '../../services/wasteManagementService';
import { ScheduleStatusBadge } from './ScheduleStatusBadge';

export function ScheduleCalendarView({ onSelectSchedule }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const res = await getWasteScheduleCalendar();
      setSchedules(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Group schedules by scheduled_date
  const groupedByDate = {};
  schedules.forEach(s => {
    const dStr = s.scheduled_date || 'Unscheduled';
    if (!groupedByDate[dStr]) groupedByDate[dStr] = [];
    groupedByDate[dStr].push(s);
  });

  const dates = Object.keys(groupedByDate).sort();

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading route collection calendar...</div>;
  }

  if (dates.length === 0) {
    return (
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '3rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
        No collection route schedules found for calendar view.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {dates.map((dateStr) => {
        const daySchedules = groupedByDate[dateStr];
        const dateObj = new Date(dateStr);
        const isToday = new Date().toISOString().split('T')[0] === dateStr;

        return (
          <div key={dateStr} style={{
            backgroundColor: '#ffffff',
            border: isToday ? '2px solid #10b981' : '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            {/* Date Group Header */}
            <div style={{
              backgroundColor: isToday ? '#ecfdf5' : '#f8fafc',
              padding: '0.75rem 1.25rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: isToday ? '#047857' : '#64748b', fontSize: '20px' }}>
                  calendar_today
                </span>
                <span style={{ fontWeight: '800', color: isToday ? '#047857' : '#0f172a', fontSize: '0.95rem' }}>
                  {dateStr} ({dateObj.toLocaleDateString('en-US', { weekday: 'long' })})
                </span>
                {isToday && (
                  <span style={{ backgroundColor: '#10b981', color: '#ffffff', fontSize: '0.7rem', fontWeight: '700', padding: '0.1rem 0.5rem', borderRadius: '10px' }}>
                    TODAY
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                {daySchedules.length} Route(s) Scheduled
              </span>
            </div>

            {/* Routes list for this date */}
            <div style={{ padding: '0.75rem 1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {daySchedules.map((s) => (
                <div
                  key={s.id}
                  onClick={() => onSelectSchedule(s)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#047857' }}>#{s.schedule_code}</span>
                    <ScheduleStatusBadge status={s.status} />
                  </div>

                  <h5 style={{ margin: '0 0 0.2rem 0', color: '#0f172a', fontSize: '0.92rem', fontWeight: '700' }}>
                    {s.route_name}
                  </h5>

                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.5rem' }}>
                    {s.area || 'Citywide'} ({s.ward}) • Time: <strong>{s.scheduled_time}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderTop: '1px dashed #e2e8f0', paddingTop: '0.4rem', color: '#475569' }}>
                    <span>Truck: <strong>{s.vehicle_number || 'Unassigned'}</strong></span>
                    <span>Driver: <strong>{s.driver_name || 'Unassigned'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
