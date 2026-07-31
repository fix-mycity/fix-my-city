import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import ScheduleForm from '../../components/waterAuthority/ScheduleForm';
import { createSupplySchedule } from '../../services/waterSupplyService';

export default function AddSchedule() {
  const navigate = useNavigate();

  const handleSubmit = async (payload) => {
    try {
      await createSupplySchedule(payload);
      toast.success('Water supply schedule created successfully!');
      navigate('/water/supply');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create supply schedule.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Navigation Back */}
      <div>
        <button 
          onClick={() => navigate('/water/supply')}
          className="water-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: 'none', color: 'var(--water-primary-light)', fontWeight: '700', padding: 0 }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Supply Schedules
        </button>
      </div>

      <ScheduleForm 
        onSubmit={handleSubmit}
        onCancel={() => navigate('/water/supply')}
      />
    </div>
  );
}
