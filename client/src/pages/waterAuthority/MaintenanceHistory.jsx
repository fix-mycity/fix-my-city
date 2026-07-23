import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import MaintenanceTimeline from '../../components/waterAuthority/MaintenanceTimeline';
import { getMaintenanceHistory } from '../../services/maintenanceService';

export default function MaintenanceHistory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getMaintenanceHistory(id);
        setHistory(response.data);
      } catch (err) {
        toast.error("Failed to load maintenance history logs.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '2.5rem', color: 'var(--water-primary-light)' }}>
          autorenew
        </span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button 
          onClick={() => navigate(`/water/maintenance/${id}`)}
          className="water-btn-icon" 
          title="Back to Details"
          style={{ border: '1px solid var(--water-border)', width: '36px', height: '36px', borderRadius: '8px' }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--water-text)', margin: 0 }}>
            Audit & Life Cycle Timeline
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)' }}>
            Complete audit trail detailing transitions, supervisor updates, photo additions, and logistics.
          </span>
        </div>
      </div>

      <MaintenanceTimeline histories={history} />
    </div>
  );
}
