import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import EmergencyStatusBadge from '../../components/waterAuthority/EmergencyStatusBadge';
import EmergencyPriorityBadge from '../../components/waterAuthority/EmergencyPriorityBadge';
import { getEmergencies } from '../../services/emergencyService';

export default function EmergencyHistory() {
  const navigate = useNavigate();

  const [emergencies, setEmergencies] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      // Query with status filter of CLOSED or RESTORED. We can just list all matching search,
      // and filter locally or query without status filter but only display RESTORED and CLOSED.
      // Let's query all without status parameter first, then filter, or let's allow searching across all resolved incidents.
      const response = await getEmergencies({
        page,
        page_size: 10,
        search: search || undefined
      });

      // Filter locally for CLOSED or RESTORED
      const historyItems = response.data.items.filter(item => 
        ['RESTORED', 'CLOSED'].includes(item.status)
      );

      setEmergencies(historyItems);
      setTotalItems(historyItems.length);
      setTotalPages(response.data.total_pages);
    } catch (err) {
      toast.error("Failed to load emergency history records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button 
          onClick={() => navigate('/water/emergency')}
          className="water-btn-icon" 
          title="Back to control center"
          style={{ border: '1px solid var(--water-border)', width: '36px', height: '36px', borderRadius: '8px' }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--water-text)', margin: 0 }}>
            Incident Resolution Logs (History)
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)' }}>
            Complete historical registry of closed and restored emergency shutdowns.
          </span>
        </div>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search logs by shutdown number, title, ward..."
          className="water-input"
        />
        <button 
          onClick={fetchHistory}
          className="water-btn"
          style={{ backgroundColor: 'var(--water-primary)', color: '#ffffff', border: 'none' }}
        >
          Search
        </button>
      </div>

      {/* Table grid */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '2rem', color: 'var(--water-primary-light)' }}>
            autorenew
          </span>
        </div>
      ) : (
        <div style={{ width: '100%', overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid var(--water-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--water-bg-light)', borderBottom: '2px solid var(--water-border)' }}>
                <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Shutdown No.</th>
                <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Title</th>
                <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Type</th>
                <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Priority</th>
                <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Ward / Area</th>
                <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Shutdown Start</th>
                <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Actual Restore</th>
                <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)', textAlign: 'center' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {emergencies.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '2rem', textAlign: 'center', color: 'var(--water-text-muted)' }}>
                    No resolved/closed emergency logs found.
                  </td>
                </tr>
              ) : (
                emergencies.map((e) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--water-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary-light)' }}>
                      {e.shutdown_number}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '600' }}>
                      {e.title}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {e.emergency_type.replace(/_/g, ' ')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <EmergencyPriorityBadge priority={e.priority} />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '600' }}>{e.ward}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>{e.area}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <EmergencyStatusBadge status={e.status} />
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--water-text-muted)' }}>
                      {new Date(e.shutdown_start).toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--water-text-muted)' }}>
                      {e.actual_restore_time ? new Date(e.actual_restore_time).toLocaleString() : '--'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button 
                        onClick={() => navigate(`/water/emergency/${e.id}`)}
                        className="water-btn-icon" 
                        title="View Details"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--water-primary-light)' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>visibility</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
