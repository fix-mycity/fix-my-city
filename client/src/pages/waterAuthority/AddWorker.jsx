import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import WorkerForm from '../../components/waterAuthority/WorkerForm';
import { createWorker } from '../../services/workerService';

export default function AddWorker() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await createWorker(data);
      toast.success("Field worker registered successfully!");
      navigate('/water/workers');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/water/workers');
  };

  return (
    <div className="water-add-worker-page" style={{ padding: '1rem 0' }}>
      {isSubmitting && (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--water-primary-light)', animation: 'spin 1.5s linear infinite' }}>
            sync
          </span>
          <p style={{ marginTop: '1rem', color: 'var(--water-text-muted)', fontWeight: '600' }}>Encrypting password and registering worker in city databases...</p>
        </div>
      )}
      <div style={{ display: isSubmitting ? 'none' : 'block' }}>
        <WorkerForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEdit={false}
        />
      </div>
    </div>
  );
}
