import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import ScheduleForm from '../../components/waterAuthority/ScheduleForm';
import { getSupplyScheduleById, updateSupplySchedule } from '../../services/waterSupplyService';

export default function EditSchedule() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      setIsLoading(true);
      try {
        const response = await getSupplyScheduleById(id);
        setSchedule(response.data);
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Failed to fetch schedule data.');
        navigate('/water/supply');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchSchedule();
    }
  }, [id, navigate]);

  const handleSubmit = async (payload) => {
    try {
      await updateSupplySchedule(id, payload);
      toast.success('Water supply schedule updated successfully!');
      navigate(`/water/supply/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update supply schedule.');
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '3rem', color: 'var(--water-primary-light)' }}>
          autorenew
        </span>
      </div>
    );
  }

  if (!schedule) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Navigation Back */}
      <div>
        <button 
          onClick={() => navigate(`/water/supply/${id}`)}
          className="water-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: 'none', color: 'var(--water-primary-light)', fontWeight: '700', padding: 0 }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Cancel and Go Back
        </button>
      </div>

      <ScheduleForm 
        initialData={schedule}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/water/supply/${id}`)}
        isEdit={true}
      />
    </div>
  );
}
