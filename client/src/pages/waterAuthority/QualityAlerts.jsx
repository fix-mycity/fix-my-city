import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import QualityAlertCard from '../../components/waterAuthority/QualityAlertCard';
import { getQualityAlerts, resolveQualityAlert } from '../../services/qualityAlertService';

export default function QualityAlerts() {
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Tabs: ACTIVE, RESOLVED
  const [activeTab, setActiveTab] = useState('ACTIVE');

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const response = await getQualityAlerts({
        page,
        page_size: 10,
        status: activeTab
      });
      setAlerts(response.data.items);
      setTotalItems(response.data.total_items);
      setTotalPages(response.data.total_pages);
    } catch (err) {
      toast.error("Failed to load active water quality alerts.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    fetchAlerts();
  }, [page]);

  const handleResolve = async (id) => {
    try {
      await resolveQualityAlert(id);
      toast.success("Quality alarm resolved successfully!");
      fetchAlerts();
    } catch (err) {
      toast.error("Failed to resolve water quality alarm.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button 
          onClick={() => navigate('/water/quality')}
          className="water-btn-icon" 
          title="Back to Dashboard"
          style={{ border: '1px solid var(--water-border)', width: '36px', height: '36px', borderRadius: '8px' }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--water-text)', margin: 0 }}>
            Water Quality Alarms & Notifications
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)' }}>
            Real-time notifications triggered automatically when values violate sanitation guidelines.
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--water-border)' }}>
        <button 
          onClick={() => setActiveTab('ACTIVE')}
          style={{
            padding: '0.5rem 1rem',
            fontWeight: '700',
            fontSize: '0.85rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'ACTIVE' ? '3px solid #c0392b' : '3px solid transparent',
            color: activeTab === 'ACTIVE' ? '#c0392b' : 'var(--water-text-muted)',
            cursor: 'pointer'
          }}
        >
          Active Alarms
        </button>
        <button 
          onClick={() => setActiveTab('RESOLVED')}
          style={{
            padding: '0.5rem 1rem',
            fontWeight: '700',
            fontSize: '0.85rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'RESOLVED' ? '3px solid var(--water-success)' : '3px solid transparent',
            color: activeTab === 'RESOLVED' ? 'var(--water-success)' : 'var(--water-text-muted)',
            cursor: 'pointer'
          }}
        >
          Resolved Archive
        </button>
      </div>

      {/* Main content list */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '2.5rem', color: 'var(--water-primary-light)' }}>
            autorenew
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {alerts.length === 0 ? (
            <div className="water-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--water-text-muted)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem', color: 'var(--water-border)' }}>
                notifications_off
              </span>
              No alarms found in this category.
            </div>
          ) : (
            alerts.map(a => (
              <QualityAlertCard 
                key={a.id} 
                alert={a} 
                onResolve={handleResolve} 
              />
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)' }}>
                Showing page {page} of {totalPages} ({totalItems} items)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  className="water-btn"
                  style={{ opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                >
                  Previous
                </button>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  className="water-btn"
                  style={{ opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
