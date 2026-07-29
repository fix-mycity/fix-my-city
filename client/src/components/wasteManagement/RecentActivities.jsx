import React from 'react';

export default function RecentActivities({ summary }) {
  const recentComplaints = summary?.recent_complaints || [];
  const workerAssignments = summary?.worker_assignments || [];
  const vehicleUpdates = summary?.vehicle_updates || [];

  return (
    <div className="waste-bottom-grid">
      {/* 1. Latest Complaints & Worker Assignments Panel */}
      <div className="waste-panel">
        <div className="waste-panel-header">
          <h3 className="waste-panel-title">
            <span className="material-symbols-outlined" style={{ color: '#10b981' }}>history</span>
            Latest Complaints & Worker Tasks
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Realtime Activity</span>
        </div>
        <div className="waste-panel-body">
          {recentComplaints.length > 0 ? (
            recentComplaints.slice(0, 4).map((c) => (
              <div key={c.id} className="waste-activity-item">
                <div className="waste-activity-icon" style={{ backgroundColor: c.status === 'COMPLETED' ? '#ecfdf5' : '#fef2f2', color: c.status === 'COMPLETED' ? '#10b981' : '#ef4444' }}>
                  <span className="material-symbols-outlined">
                    {c.status === 'COMPLETED' ? 'check_circle' : 'report_problem'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0f172a' }}>
                    #{c.complaint_number}: {c.title}
                  </span>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                    <span>Area: {c.area || 'Citywide'}</span>
                    <span>Category: {c.category}</span>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '12px',
                  backgroundColor: c.status === 'COMPLETED' ? '#d1fae5' : '#fee2e2',
                  color: c.status === 'COMPLETED' ? '#047857' : '#b91c1c'
                }}>
                  {c.status}
                </span>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
              No recent complaints logged yet.
            </div>
          )}
        </div>
      </div>

      {/* 2. Vehicle Fleet & Worker Activity Feed */}
      <div className="waste-panel">
        <div className="waste-panel-header">
          <h3 className="waste-panel-title">
            <span className="material-symbols-outlined" style={{ color: '#06b6d4' }}>local_shipping</span>
            Vehicle Updates & Worker Assignments
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Operations Feed</span>
        </div>
        <div className="waste-panel-body">
          {workerAssignments.length > 0 ? (
            workerAssignments.slice(0, 4).map((wa) => (
              <div key={wa.id} className="waste-activity-item">
                <div className="waste-activity-icon" style={{ backgroundColor: '#ecfeff', color: '#06b6d4' }}>
                  <span className="material-symbols-outlined">badge</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0f172a' }}>
                    {wa.worker_name}: {wa.task}
                  </span>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                    <span>Code: {wa.assignment_code}</span>
                    <span>Assigned: {wa.assigned_at}</span>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '12px',
                  backgroundColor: '#ecfeff',
                  color: '#0e7490'
                }}>
                  {wa.status}
                </span>
              </div>
            ))
          ) : vehicleUpdates.length > 0 ? (
            vehicleUpdates.slice(0, 4).map((v) => (
              <div key={v.id} className="waste-activity-item">
                <div className="waste-activity-icon" style={{ backgroundColor: '#f0fdf4', color: '#047857' }}>
                  <span className="material-symbols-outlined">local_shipping</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0f172a' }}>
                    Vehicle {v.vehicle_number} ({v.vehicle_type})
                  </span>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                    <span>Driver: {v.driver_name}</span>
                    <span>Location: {v.last_location}</span>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '12px',
                  backgroundColor: '#d1fae5',
                  color: '#047857'
                }}>
                  {v.status}
                </span>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
              No vehicle or assignment updates yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
