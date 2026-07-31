import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import InspectionForm from '../../components/waterAuthority/InspectionForm';
import InspectionTable from '../../components/waterAuthority/InspectionTable';
import PipelineStatusBadge from '../../components/waterAuthority/PipelineStatusBadge';

import { getPipelineById } from '../../services/pipelineService';
import { getInspectionsForPipeline, createInspection, deleteInspection } from '../../services/inspectionService';

export default function InspectionHistory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pipeline, setPipeline] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInspections = async () => {
    setIsLoading(true);
    try {
      const pRes = await getPipelineById(id);
      setPipeline(pRes.data);

      const iRes = await getInspectionsForPipeline(id);
      setInspections(iRes.data);
    } catch (err) {
      toast.error("Failed to load inspection history.");
      navigate('/water/pipelines');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchInspections();
    }
  }, [id]);

  const handleSubmitInspection = async (payload) => {
    try {
      await createInspection(id, payload);
      toast.success("Inspection log recorded successfully!");
      fetchInspections(); // reload data
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit inspection.");
    }
  };

  const handleDeleteInspection = async (insId) => {
    if (window.confirm("Are you sure you want to delete this inspection record?")) {
      try {
        await deleteInspection(insId);
        toast.success("Inspection record deleted successfully.");
        fetchInspections();
      } catch (err) {
        toast.error("Failed to delete record.");
      }
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
      
      {/* Header / Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={() => navigate(`/water/pipelines/${id}`)}
          className="water-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: 'none', color: 'var(--water-primary-light)', fontWeight: '700', padding: 0 }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Pipeline Details
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--water-text)' }}>
            Pipeline Inspection Logs
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--water-text-muted)', marginTop: '0.2rem' }}>
            Pipeline: <strong>{pipeline.pipeline_number}</strong> ({pipeline.pipeline_name || 'N/A'}) | Status: <PipelineStatusBadge status={pipeline.current_status} />
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        {/* Form Container */}
        <div>
          <InspectionForm 
            onSubmit={handleSubmitInspection}
            onCancel={() => navigate(`/water/pipelines/${id}`)}
            initialPipelineCondition={pipeline.condition}
          />
        </div>

        {/* History Listing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
              Recorded History
            </h3>
            <InspectionTable inspections={inspections} onDelete={handleDeleteInspection} />
          </div>
        </div>
      </div>

    </div>
  );
}
