import React from 'react';

export default function TaskTable({ tasks = [], workers = [], onUpdateStatus }) {
  const getWorkerName = (workerId) => {
    if (!workerId) return 'Unassigned';
    const found = workers.find(w => w.id === workerId);
    return found ? `${found.first_name} ${found.last_name}` : `Worker #${workerId}`;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'COMPLETED':
        return { color: 'var(--water-success)', fontWeight: '700' };
      case 'IN_PROGRESS':
        return { color: 'var(--water-warning)', fontWeight: '700' };
      default:
        return { color: 'var(--water-text-muted)', fontWeight: '700' };
    }
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid var(--water-border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--water-bg-light)', borderBottom: '2px solid var(--water-border)' }}>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Task Name</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Description</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Assigned Worker</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Assigned Date</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Status</th>
            {onUpdateStatus && (
              <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)', textAlign: 'center' }}>Change Status</th>
            )}
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={onUpdateStatus ? 6 : 5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--water-text-muted)' }}>
                No micro-tasks defined for this maintenance request.
              </td>
            </tr>
          ) : (
            tasks.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--water-border)' }}>
                <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-text)' }}>
                  {t.task_name}
                </td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--water-text-muted)' }}>
                  {t.task_description || '--'}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  {getWorkerName(t.worker_id)}
                </td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--water-text-muted)' }}>
                  {new Date(t.assigned_date).toLocaleDateString()}
                </td>
                <td style={{ padding: '0.75rem 1rem', ...getStatusStyle(t.status) }}>
                  {t.status}
                </td>
                {onUpdateStatus && (
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <select
                      value={t.status}
                      onChange={(e) => onUpdateStatus(t.id, e.target.value)}
                      className="water-input"
                      style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', width: 'auto', display: 'inline-block' }}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
