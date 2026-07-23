import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import PipelineForm from '../../components/waterAuthority/PipelineForm';
import { createPipeline } from '../../services/pipelineService';

export default function AddPipeline() {
  const navigate = useNavigate();

  const handleSubmit = async (payload) => {
    try {
      await createPipeline(payload);
      toast.success('Water pipeline registered successfully!');
      navigate('/water/pipelines');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to register pipeline.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <button 
          onClick={() => navigate('/water/pipelines')}
          className="water-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: 'none', color: 'var(--water-primary-light)', fontWeight: '700', padding: 0 }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Pipelines
        </button>
      </div>

      <PipelineForm 
        onSubmit={handleSubmit}
        onCancel={() => navigate('/water/pipelines')}
      />
    </div>
  );
}
