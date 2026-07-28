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
      toast.success('Municipal water pipeline network registered successfully!');
      navigate('/water/pipelines');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to register pipeline network.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={() => navigate('/water/pipelines')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            border: 'none',
            background: 'none',
            color: '#2563eb',
            fontWeight: '700',
            fontSize: '0.9rem',
            padding: 0,
            cursor: 'pointer'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
          Back to Pipeline Network Management
        </button>

        <span style={{ fontSize: '0.8rem', color: 'var(--water-text-muted)', fontWeight: '600' }}>
          Water Authority Department • Area Distribution System
        </span>
      </div>

      <PipelineForm 
        onSubmit={handleSubmit}
        onCancel={() => navigate('/water/pipelines')}
      />
    </div>
  );
}
