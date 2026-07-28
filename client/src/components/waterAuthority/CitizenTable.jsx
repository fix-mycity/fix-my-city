import React from "react";
import CitizenStatusBadge from "./CitizenStatusBadge";

export default function CitizenTable({ 
  citizens = [], 
  total = 0, 
  page = 1, 
  pageSize = 10, 
  onPageChange, 
  onView, 
  onToggleStatus 
}) {
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <div style={{ width: '100%', overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#1e3a8a' }}>Citizen ID</th>
            <th style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#1e3a8a' }}>Name</th>
            <th style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#1e3a8a' }}>Contact Info</th>
            <th style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#1e3a8a' }}>Location (Ward/Area)</th>
            <th style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#1e3a8a' }}>Service Status</th>
            <th style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#1e3a8a', textAlign: 'center' }}>Complaints</th>
            <th style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#1e3a8a', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {citizens.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>
                  person_off
                </span>
                No registered municipal citizens found matching current search.
              </td>
            </tr>
          ) : (
            citizens.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#2563eb' }}>
                  #{c.user_id}
                </td>
                <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: '#0f172a' }}>
                  {c.full_name || "Anonymous Citizen"}
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: '500', color: '#334155' }}>{c.email}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.phone_number || "No Phone"}</div>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: '600', color: '#0f172a' }}>{c.ward || "Not Configured"}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.area || "Not Configured"}</div>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <CitizenStatusBadge status={c.service_status} />
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: '700', color: '#2563eb' }}>
                  {c.complaint_count}
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                    <button
                      onClick={() => onView(c.user_id)}
                      style={{
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        border: 'none',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>visibility</span>
                      View
                    </button>

                    <button
                      onClick={() => onToggleStatus(c.user_id, c.service_status, c.ward, c.area)}
                      style={{
                        backgroundColor: c.service_status === "ENABLED" ? '#fef2f2' : '#f0fdf4',
                        color: c.service_status === "ENABLED" ? '#dc2626' : '#16a34a',
                        border: `1px solid ${c.service_status === "ENABLED" ? '#fecaca' : '#bbf7d0'}`,
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                        {c.service_status === "ENABLED" ? "block" : "check_circle"}
                      </span>
                      {c.service_status === "ENABLED" ? "Disable" : "Enable"}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Page {page} of {totalPages} ({total} citizens)
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.5 : 1
              }}
            >
              Previous
            </button>
            <button 
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                opacity: page === totalPages ? 0.5 : 1
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
