import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import EmergencyForm from '../../components/waterAuthority/EmergencyForm';
import { createEmergency } from '../../services/emergencyService';
import { getPipelines } from '../../services/pipelineService';
import { getTanks } from '../../services/waterTankService';
import { getSupplySchedules } from '../../services/waterSupplyService';

export default function AddEmergency() {
  const navigate = useNavigate();

  const [pipelines, setPipelines] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pipeRes = await getPipelines({ page_size: 1000 });
        setPipelines(pipeRes.data.items || []);

        const tankRes = await getTanks({ page_size: 1000 });
        setTanks(tankRes.data.items || []);

        const schedRes = await getSupplySchedules({ page_size: 1000 });
        setSchedules(schedRes.data.items || []);
      } catch (err) {
        console.error("Could not fetch resources directory:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (payload) => {
    try {
      const response = await createEmergency(payload);
      toast.success("Emergency shutdown declared successfully!");
      navigate(`/water/emergency/${response.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit emergency declaration.");
    }
  };

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
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <EmergencyForm 
        pipelines={pipelines}
        tanks={tanks}
        schedules={schedules}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/water/emergency')}
      />
    </div>
  );
}
