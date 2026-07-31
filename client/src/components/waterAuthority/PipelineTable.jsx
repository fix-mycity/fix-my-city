import React from 'react';
import PipelineStatusBadge from './PipelineStatusBadge';
import PipelineConditionBadge from './PipelineConditionBadge';

export default function PipelineTable({ 
  pipelines, 
  onView, 
  onEdit, 
  onInspection, 
  onMaintenance, 
  onDelete 
}) {
  return (
    <div style={{ width: '100%', overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid var(--water-border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--water-bg-light)', borderBottom: '2px solid var(--water-border)' }}>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Pipeline No.</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Name</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Zone / Ward</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Area</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Type</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Material / Length</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Condition</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Status</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Last Inspection</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pipelines.length === 0 ? (
            <tr>
              <td colSpan="10" style={{ padding: '3rem', textAlign: 'center', color: 'var(--water-text-muted)', fontWeight: '500' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem', color: 'var(--water-border)' }}>
                  schema
                </span>
                No pipelines found matching criteria.
              </td>
            </tr>
          ) : (
            pipelines.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--water-border)', transition: 'background-color 0.2s' }} className="hover-row">
                <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary-light)' }}>
                  {p.pipeline_number}
                </td>
                <td style={{ padding: '1rem', fontWeight: '600' }}>
                  {p.pipeline_name || 'N/A'}
                </td>
                <td style={{ padding: '1rem' }}>
                  <div>{p.zone || 'N/A'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>{p.ward}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  {p.area}
                </td>
                <td style={{ padding: '1rem', fontWeight: '500' }}>
                  {p.pipeline_type.replace(/_/g, ' ')}
                </td>
                <td style={{ padding: '1rem' }}>
                  <div>{p.material}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>{p.length ? `${p.length} m` : 'N/A'}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <PipelineConditionBadge condition={p.condition} />
                </td>
                <td style={{ padding: '1rem' }}>
                  <PipelineStatusBadge status={p.current_status} />
                </td>
                <td style={{ padding: '1rem', color: 'var(--water-text-muted)' }}>
                  {p.last_inspection || 'Never'}
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem' }}>
                    <button 
                      onClick={() => onView(p.id)}
                      className="water-btn-icon" 
                      title="View Details"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0.2rem', color: 'var(--water-primary-light)' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>visibility</span>
                    </button>
                    <button 
                      onClick={() => onEdit(p.id)}
                      className="water-btn-icon" 
                      title="Modify Pipeline"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0.2rem', color: 'var(--water-primary)' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>edit</span>
                    </button>
                    <button 
                      onClick={() => onInspection(p.id)}
                      className="water-btn-icon" 
                      title="Record Inspection"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0.2rem', color: 'var(--water-success)' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>fact_check</span>
                    </button>
                    <button 
                      onClick={() => onMaintenance(p.id)}
                      className="water-btn-icon" 
                      title="Schedule Maintenance"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0.2rem', color: 'var(--water-warning)' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>build</span>
                    </button>
                    <button 
                      onClick={() => onDelete(p.id)}
                      className="water-btn-icon" 
                      title="Delete Pipeline"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0.2rem', color: 'var(--water-danger)' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
