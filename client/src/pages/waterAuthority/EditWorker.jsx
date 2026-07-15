import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import WorkerForm from '../../components/waterAuthority/WorkerForm';
import { getWorkerById, updateWorker } from '../../services/workerService';

export default function EditWorker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const response = await getWorkerById(id);
        setWorker(response.data);
      } catch (err) {
        toast.error("Failed to load worker profiles data.");
        navigate('/water/workers');
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorker();
  }, [id, navigate]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await updateWorker(id, data);
      toast.success("Field worker details updated successfully!");
      navigate('/water/workers');
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save worker modifications.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/water/workers');
  };

  return (
    <div className="water-edit-worker-page" style={{ padding: '1rem 0' }}>
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--water-primary-light)', animation: 'spin 1.5s linear infinite' }}>
            sync
          </span>
          <p style={{ marginTop: '0.5rem', color: 'var(--water-text-muted)' }}>Retrieving employee details...</p>
        </div>
      ) : isSubmitting ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--water-primary-light)', animation: 'spin 1.5s linear infinite' }}>
            sync
          </span>
          <p style={{ marginTop: '1rem', color: 'var(--water-text-muted)', fontWeight: '600' }}>Saving database entries...</p>
        </div>
      ) : (
        <WorkerForm 
          initialData={worker}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEdit={true}
        />
      )}
    </div>
  );
}
