import React from 'react';
import { useNavigate } from 'react-router-dom';
import ScheduleStatusBadge from './ScheduleStatusBadge';

export default function ScheduleCard({ schedule }) {
  const navigate = useNavigate();

  const formatTime = (timeStr) => {
    if (!timeStr) return null;
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
  };

  const hasMorning = schedule.morning_start_time && schedule.morning_end_time;
  const hasEvening = schedule.evening_start_time && schedule.evening_end_time;

  return (
    <div 
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--water-border)',
        borderRadius: '16px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        boxShadow: 'var(--water-shadow-sm)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        position: 'relative'
      }}
      onClick={() => navigate(`/water/supply/${schedule.id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--water-shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'var(--water-shadow-sm)';
      }}
    >
      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--water-text-muted)', textTransform: 'uppercase' }}>
            {schedule.schedule_number}
          </span>
          <h4 style={{ margin: '0.15rem 0 0', fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-primary)' }}>
            {schedule.ward} - {schedule.area}
          </h4>
          {schedule.street && (
            <span style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)', display: 'block', marginTop: '0.1rem' }}>
              {schedule.street}
            </span>
          )}
        </div>
        <ScheduleStatusBadge status={schedule.status} />
      </div>

      {/* Timing Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.2rem' }}>
        {hasMorning && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--water-text)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: 'var(--water-warning)' }}>wb_sunny</span>
            <span>Morning: <strong>{formatTime(schedule.morning_start_time)} - {formatTime(schedule.morning_end_time)}</strong></span>
          </div>
        )}
        {hasEvening && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--water-text)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: '#1e3a8a' }}>nights_stay</span>
            <span>Evening: <strong>{formatTime(schedule.evening_start_time)} - {formatTime(schedule.evening_end_time)}</strong></span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: 'var(--water-border)' }} />

      {/* Footer Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
        <span style={{ color: 'var(--water-text-muted)', fontWeight: '600' }}>
          Date: <strong>{schedule.supply_date}</strong>
        </span>
        <span style={{
          padding: '0.15rem 0.45rem',
          fontSize: '0.65rem',
          fontWeight: '700',
          borderRadius: '4px',
          backgroundColor: schedule.supply_type === 'EMERGENCY' ? 'var(--water-danger-subtle)' : schedule.supply_type === 'SPECIAL' ? 'var(--water-info-subtle)' : 'var(--water-bg)',
          color: schedule.supply_type === 'EMERGENCY' ? 'var(--water-danger)' : schedule.supply_type === 'SPECIAL' ? 'var(--water-info)' : 'var(--water-text)',
          textTransform: 'uppercase'
        }}>
          {schedule.supply_type}
        </span>
      </div>
    </div>
  );
}
