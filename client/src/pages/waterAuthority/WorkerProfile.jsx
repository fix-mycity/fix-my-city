import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import WorkerProfileCard from '../../components/waterAuthority/WorkerProfileCard';
import { getWorkerById } from '../../services/workerService';

export default function WorkerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const response = await getWorkerById(id);
        setWorker(response.data);
      } catch (err) {
        toast.error("Failed to load worker profile details.");
        navigate('/water/workers');
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorker();
  }, [id, navigate]);

  const handleEditClick = (workerId) => {
    navigate(`/water/workers/${workerId}/edit`);
  };

  const handleBackClick = () => {
    navigate('/water/workers');
  };

  return (
    <div className="water-worker-profile-page" style={{ padding: '1rem 0' }}>
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--water-primary-light)', animation: 'spin 1.5s linear infinite' }}>
            sync
          </span>
          <p style={{ marginTop: '0.5rem', color: 'var(--water-text-muted)' }}>Retrieving profile...</p>
        </div>
      ) : (
        <WorkerProfileCard 
          worker={worker}
          onEditClick={handleEditClick}
          onBackClick={handleBackClick}
        />
      )}
    </div>
  );
}
