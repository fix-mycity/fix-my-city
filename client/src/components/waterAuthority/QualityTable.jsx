import React from 'react';
import QualityStatusBadge from './QualityStatusBadge';

export default function QualityTable({ reports, onView, onEdit, onDelete }) {
  return (
    <div style={{ width: '100%', overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid var(--water-border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--water-bg-light)', borderBottom: '2px solid var(--water-border)' }}>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Report Number</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Ward / Area</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Sample Type</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>pH</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>TDS</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Chlorine</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Bacteria</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Status</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Inspector</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Sample Date</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.length === 0 ? (
            <tr>
              <td colSpan="11" style={{ padding: '3rem', textAlign: 'center', color: 'var(--water-text-muted)', fontWeight: '500' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem', color: 'var(--water-border)' }}>
                  science
                </span>
                No water quality reports found.
              </td>
            </tr>
          ) : (
            reports.map((r) => {
              const isBacteria = r.bacteria_present;

              return (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--water-border)' }} className="hover-row">
                  <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary-light)' }}>
                    {r.report_number}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '600' }}>{r.ward}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>{r.area}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {r.sample_type.replace(/_/g, ' ')}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '700', color: r.ph_level < 6.5 || r.ph_level > 8.5 ? '#e67e22' : 'var(--water-text)' }}>
                    {r.ph_level.toFixed(1)}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>
                    {r.tds.toFixed(0)} mg/L
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {r.chlorine_level.toFixed(2)} mg/L
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {isBacteria ? (
                      <span style={{ color: '#c0392b', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>bug_report</span>
                        FOUND
                      </span>
                    ) : (
                      <span style={{ color: 'var(--water-text-muted)' }}>Absent</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <QualityStatusBadge status={r.overall_status} />
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--water-text-muted)' }}>
                    {r.tested_by || 'Unspecified'}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>
                    {r.sample_date}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                      <button 
                        onClick={() => onView(r.id)}
                        className="water-btn-icon" 
                        title="View Full Report Sheet"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--water-primary-light)', padding: '0.2rem' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>visibility</span>
                      </button>
                      <button 
                        onClick={() => onEdit(r.id)}
                        className="water-btn-icon" 
                        title="Edit Parameters"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--water-primary)', padding: '0.2rem' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>edit</span>
                      </button>
                      <button 
                        onClick={() => onDelete(r.id)}
                        className="water-btn-icon" 
                        title="Delete Report"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--water-danger)', padding: '0.2rem' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
