import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScheduleStatusBadge } from './ScheduleStatusBadge';

export function ScheduleTable({ schedules, onUpdateStatus, onAssignTeam, onDelete }) {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '700' }}>
              <th style={{ padding: '0.85rem 1rem' }}>Code</th>
              <th style={{ padding: '0.85rem 1rem' }}>Route Name</th>
              <th style={{ padding: '0.85rem 1rem' }}>Start ➔ End Waypoints</th>
              <th style={{ padding: '0.85rem 1rem' }}>Distance & Time</th>
              <th style={{ padding: '0.85rem 1rem' }}>Vehicle & Driver</th>
              <th style={{ padding: '0.85rem 1rem' }}>Bins Progress</th>
              <th style={{ padding: '0.85rem 1rem' }}>Status</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr
                key={s.id}
                onClick={() => navigate(`/waste/schedules/${s.id}`)}
                style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                className="hover:bg-slate-50"
              >
                <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#047857' }}>
                  {s.schedule_code}
                </td>
                <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#0f172a' }}>
                  {s.route_name}
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal' }}>
                    {s.ward || 'General'} • {s.waste_type}
                  </div>
                </td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem' }}>
                  <div style={{ fontWeight: '600', color: '#0f172a' }}>📍 {s.start_point || 'Depot Base'}</div>
                  <div style={{ color: '#64748b' }}>🏁 {s.end_point || 'Landfill'}</div>
                </td>
                <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: '#334155' }}>
                  {s.distance_km || 12.5} km
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>⏱️ {s.estimated_minutes || 45} mins</div>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: '600', color: '#0f172a' }}>{s.vehicle_number || 'Unassigned'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>👤 {s.driver_name || 'No driver'}</div>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>
                    {s.collected_bins_count} / {s.total_bins_count} Bins
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: '600' }}>
                    {s.collected_weight_tons} Tons
                  </div>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <ScheduleStatusBadge status={s.status} />
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/waste/schedules/${s.id}`); }}
                    title="View Route Details"
                    style={{ background: '#f0fdf4', border: '1px solid #d1fae5', color: '#047857', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer', marginRight: '6px' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onAssignTeam && onAssignTeam(s); }}
                    title="Assign Vehicle & Driver"
                    style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer', marginRight: '6px' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person_add</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onUpdateStatus(s); }}
                    title="Update Route Status"
                    style={{ background: '#e0f2fe', border: '1px solid #bae6fd', color: '#0369a1', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer', marginRight: '6px' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>update</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                    title="Delete Route"
                    style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
