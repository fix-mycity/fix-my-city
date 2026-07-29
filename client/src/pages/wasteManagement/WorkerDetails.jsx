import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/wasteManagement/PageHeader';
import { RecordAttendanceModal } from '../../components/wasteManagement/RecordAttendanceModal';
import LoadingSkeleton from '../../components/wasteManagement/LoadingSkeleton';

import { getWasteWorkerById, getWasteWorkerAttendance, deleteWasteWorker } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export default function WorkerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [worker, setWorker] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);

  const fetchWorkerDetails = async () => {
    setLoading(true);
    try {
      const [wRes, aRes] = await Promise.all([
        getWasteWorkerById(id),
        getWasteWorkerAttendance(id)
      ]);
      setWorker(wRes.data);
      setAttendanceLogs(aRes.data || []);
    } catch (err) {
      toast.error('Failed to load worker profile.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerDetails();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to remove worker ${worker.name}?`)) {
      try {
        await deleteWasteWorker(worker.id);
        toast.success('Worker record removed');
        navigate('/waste/workers');
      } catch (err) {
        toast.error('Failed to delete worker.');
      }
    }
  };

  if (loading || !worker) {
    return <LoadingSkeleton />;
  }

  // Status Badge Helper
  const getStatusBadge = (status) => {
    const map = {
      Active: { bg: '#d1fae5', color: '#047857', label: 'Active' },
      ACTIVE: { bg: '#d1fae5', color: '#047857', label: 'Active' },
      'On Leave': { bg: '#fef3c7', color: '#b45309', label: 'On Leave' },
      ON_LEAVE: { bg: '#fef3c7', color: '#b45309', label: 'On Leave' },
      Inactive: { bg: '#f1f5f9', color: '#475569', label: 'Inactive' },
      INACTIVE: { bg: '#f1f5f9', color: '#475569', label: 'Inactive' }
    };
    const current = map[status] || map.Active;
    return (
      <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '20px', backgroundColor: current.bg, color: current.color }}>
        {current.label}
      </span>
    );
  };

  return (
    <div className="waste-worker-details-page">
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => navigate('/waste/workers')}
          className="waste-btn waste-btn-secondary"
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          Back to Sanitation Staff
        </button>
      </div>

      <PageHeader
        title={`${worker.name}`}
        subtitle={`Staff ID #${worker.worker_id_number} • ${worker.role} (${worker.ward || 'General Ward'})`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Worker Info Card */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '6px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                  {worker.role}
                </span>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  {worker.name}
                </h2>
              </div>
              {getStatusBadge(worker.status)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Phone Contact</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>{worker.phone}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Email Address</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>{worker.email || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Assigned Shift</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#047857' }}>{worker.shift || 'MORNING'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Performance Score</div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#d97706', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>star</span>
                  {worker.performance_rating || 4.8} / 5.0
                </div>
              </div>
            </div>
          </div>

          {/* Assignments & Fleet Card */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: '20px' }}>assignment_ind</span>
              Fleet & Work Assignments
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: '700', textTransform: 'uppercase' }}>Assigned Collection Vehicle</div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
                  {worker.assigned_vehicle_number || 'Unassigned / Depot Pool'}
                </div>
              </div>

              <div style={{ backgroundColor: '#fffbeb', padding: '1rem', borderRadius: '8px', border: '1px solid #fde68a' }}>
                <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: '700', textTransform: 'uppercase' }}>Active Complaint Tasks</div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
                  {worker.assigned_complaints_count || 0} Open Tickets
                </div>
              </div>
            </div>
          </div>

          {/* Attendance History Audit Table */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#06b6d4', fontSize: '20px' }}>calendar_month</span>
              Daily Attendance History Log
            </h3>

            {attendanceLogs.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                No attendance entries recorded yet for this worker.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '700', textAlign: 'left' }}>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Date</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Status</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Check-In Time</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceLogs.map((a) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.65rem 0.85rem', fontWeight: '600', color: '#0f172a' }}>
                        {new Date(a.date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '20px',
                          backgroundColor: a.status === 'Present' ? '#d1fae5' : a.status === 'On Leave' ? '#fef3c7' : '#fee2e2',
                          color: a.status === 'Present' ? '#047857' : a.status === 'On Leave' ? '#b45309' : '#b91c1c'
                        }}>
                          {a.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.85rem', color: '#64748b' }}>
                        {a.check_in_time || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem 0' }}>
              Staff Management
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => setIsAttendanceOpen(true)}
                className="waste-btn waste-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>how_to_reg</span>
                Record Attendance
              </button>

              <button
                onClick={handleDelete}
                className="waste-btn"
                style={{ width: '100%', justifyContent: 'center', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                Remove Worker
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RecordAttendanceModal
        isOpen={isAttendanceOpen}
        onClose={() => setIsAttendanceOpen(false)}
        worker={worker}
        onSuccess={fetchWorkerDetails}
      />
    </div>
  );
}
