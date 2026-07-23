import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import EmergencyForm from '../../components/waterAuthority/EmergencyForm';
import { getEmergency, updateEmergency } from '../../services/emergencyService';
import { getPipelines } from '../../services/pipelineService';
import { getTanks } from '../../services/waterTankService';
import { getSupplySchedules } from '../../services/waterSupplyService';

export default function EditEmergency() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [emergency, setEmergency] = useState(null);
  const [pipelines, setPipelines] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const emRes = await getEmergency(id);
        setEmergency(emRes.data);

        const pipeRes = await getPipelines({ page_size: 1000 });
        setPipelines(pipeRes.data.items || []);

        const tankRes = await getTanks({ page_size: 1000 });
        setTanks(tankRes.data.items || []);

        const schedRes = await getSupplySchedules({ page_size: 1000 });
        setSchedules(schedRes.data.items || []);
      } catch (err) {
        toast.error("Failed to load emergency incident details.");
        navigate('/water/emergency');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (payload) => {
    try {
      await updateEmergency(id, payload);
      toast.success("Emergency details updated successfully!");
      navigate(`/water/emergency/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update emergency details.");
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
      {emergency && (
        <EmergencyForm 
          initialData={emergency}
          pipelines={pipelines}
          tanks={tanks}
          schedules={schedules}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/water/emergency/${id}`)}
          isEdit={true}
        />
      )}
    </div>
  );
}
