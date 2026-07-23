import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import PipelineForm from '../../components/waterAuthority/PipelineForm';
import { getPipelineById, updatePipeline } from '../../services/pipelineService';

export default function EditPipeline() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pipeline, setPipeline] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPipeline = async () => {
      setIsLoading(true);
      try {
        const response = await getPipelineById(id);
        setPipeline(response.data);
      } catch (err) {
        toast.error("Failed to load pipeline data.");
        navigate('/water/pipelines');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPipeline();
    }
  }, [id, navigate]);

  const handleSubmit = async (payload) => {
    try {
      await updatePipeline(id, payload);
      toast.success('Water pipeline updated successfully!');
      navigate(`/water/pipelines/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update pipeline.');
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

  if (!pipeline) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <button 
          onClick={() => navigate(`/water/pipelines/${id}`)}
          className="water-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: 'none', color: 'var(--water-primary-light)', fontWeight: '700', padding: 0 }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Cancel and Go Back
        </button>
      </div>

      <PipelineForm 
        initialData={pipeline}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/water/pipelines/${id}`)}
        isEdit={true}
      />
    </div>
  );
}
