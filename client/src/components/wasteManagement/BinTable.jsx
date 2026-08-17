import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BinFillLevelIndicator, BinStatusBadge, BinTypeBadge } from './BinFillLevelIndicator';

export function BinTable({
  bins,
  totalItems,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onUpdateFillLevel,
  onAssignRoute,
  onShowQr,
  onDeleteBin
}) {
  const navigate = useNavigate();

  if (!bins || bins.length === 0) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        color: '#64748b'
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '0.5rem' }}>
          delete_sweep
        </span>
        <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>No Waste Bins Found</h4>
        <p style={{ margin: 0, fontSize: '0.85rem' }}>No waste bins matching your current filters or search terms.</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
             <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '700' }}>
              <th style={{ padding: '0.85rem 1rem' }}>Bin Code</th>
              <th style={{ padding: '0.85rem 1rem' }}>Location & Ward</th>
              <th style={{ padding: '0.85rem 1rem' }}>Category Type</th>
              <th style={{ padding: '0.85rem 1rem' }}>Capacity</th>
              <th style={{ padding: '0.85rem 1rem' }}>Fill Level</th>
              <th style={{ padding: '0.85rem 1rem' }}>Status</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bins.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#047857', whiteSpace: 'nowrap' }}>
                  #{b.bin_code}
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: '600', color: '#0f172a' }}>{b.location}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.ward || 'General'} • {b.area || 'Citywide'}</div>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <BinTypeBadge type={b.waste_type} />
                </td>
                <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: '#334155' }}>
                  {b.capacity_liters} L
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <BinFillLevelIndicator level={b.fill_level_percentage} />
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <BinStatusBadge status={b.status} />
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                    {/* View Details */}
                    <button
                      onClick={() => navigate(`/waste/bins/${b.id}`)}
                      title="View Details"
                      style={{
                        background: '#f0fdf4',
                        border: '1px solid #a7f3d0',
                        color: '#047857',
                        padding: '0.35rem 0.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                    </button>

                    {/* Sensor Fill Level */}
                    <button
                      onClick={() => onUpdateFillLevel(b)}
                      title="Update Fill Level"
                      style={{
                        background: '#ecfeff',
                        border: '1px solid #a5f3fc',
                        color: '#0891b2',
                        padding: '0.35rem 0.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>sensors</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDeleteBin(b.id)}
                      title="Delete Bin"
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        padding: '0.35rem 0.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{
        padding: '0.85rem 1.25rem',
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        fontSize: '0.82rem',
        color: '#64748b'
      }}>
        <div>
          Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalItems} total smart bins)
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="waste-btn waste-btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
          >
            Previous
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="waste-btn waste-btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
