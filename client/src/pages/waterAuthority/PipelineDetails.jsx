import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import PipelineStatusBadge from '../../components/waterAuthority/PipelineStatusBadge';
import PipelineConditionBadge from '../../components/waterAuthority/PipelineConditionBadge';
import InspectionTable from '../../components/waterAuthority/InspectionTable';
import MaintenanceTable from '../../components/waterAuthority/MaintenanceTable';
import PipelineTimeline from '../../components/waterAuthority/PipelineTimeline';

import { getPipelineById, updatePipeline, deletePipeline } from '../../services/pipelineService';
import { getInspectionsForPipeline, deleteInspection } from '../../services/inspectionService';
import { getMaintenancesForPipeline, deleteMaintenance } from '../../services/maintenanceService';

export default function PipelineDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pipeline, setPipeline] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const pRes = await getPipelineById(id);
      setPipeline(pRes.data);
    } catch (err) {
      toast.error("Could not load pipeline details.");
      navigate('/water/pipelines');
      setIsLoading(false);
      return;
    }

    try {
      const iRes = await getInspectionsForPipeline(id);
      setInspections(Array.isArray(iRes.data) ? iRes.data : []);
    } catch (_iErr) {
      setInspections([]);
    }

    try {
      const mRes = await getMaintenancesForPipeline(id);
      setMaintenances(Array.isArray(mRes.data) ? mRes.data : []);
    } catch (_mErr) {
      setMaintenances([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  const handleMarkDamaged = async () => {
    try {
      const response = await updatePipeline(id, { current_status: 'DAMAGED' });
      setPipeline(response.data);
      toast.success("Pipeline status marked as DAMAGED.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update pipeline status.");
    }
  };

  const handleMarkRepaired = async () => {
    try {
      const response = await updatePipeline(id, { current_status: 'ACTIVE' });
      setPipeline(response.data);
      toast.success("Pipeline status marked as repaired (ACTIVE).");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update pipeline status.");
    }
  };

  const handleDeletePipeline = async () => {
    if (window.confirm("Are you sure you want to delete this pipeline permanently?")) {
      try {
        await deletePipeline(id);
        toast.success("Pipeline deleted successfully.");
        navigate('/water/pipelines');
      } catch (err) {
        toast.error("Failed to delete pipeline.");
      }
    }
  };

  const handleDeleteInspection = async (insId) => {
    if (window.confirm("Delete this inspection log?")) {
      try {
        await deleteInspection(insId);
        toast.success("Inspection log deleted.");
        fetchDetails();
      } catch (err) {
        toast.error("Failed to delete inspection log.");
      }
    }
  };

  const handleDeleteMaintenance = async (maintId) => {
    if (window.confirm("Delete this maintenance log?")) {
      try {
        await deleteMaintenance(maintId);
        toast.success("Maintenance log deleted.");
        fetchDetails();
      } catch (err) {
        toast.error("Failed to delete maintenance log.");
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

  // Filter leak history (inspections where a leak was flagged)
  const leaks = inspections.filter(ins => ins.leak_detected);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Navigation & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={() => navigate('/water/pipelines')}
          className="water-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: 'none', color: 'var(--water-primary-light)', fontWeight: '700', padding: 0 }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Pipelines
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)' }}>
          Last modified: {new Date(pipeline.updated_at).toLocaleString()}
        </span>
      </div>

      {/* Main Details Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--water-text)' }}>
            Pipeline: {pipeline.pipeline_number}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--water-text-muted)', marginTop: '0.2rem' }}>
            Name: <strong>{pipeline.pipeline_name || 'N/A'}</strong> | Type: <strong>{pipeline.pipeline_type.replace(/_/g, ' ')}</strong>
          </p>
        </div>

        {/* Operational Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate(`/water/pipelines/${id}/edit`)}
            className="water-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', borderColor: 'var(--water-primary-light)', color: 'var(--water-primary-light)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>edit</span>
            Modify
          </button>

          {pipeline.current_status !== 'DAMAGED' && (
            <button 
              onClick={handleMarkDamaged}
              className="water-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', borderColor: 'var(--water-danger)', color: 'var(--water-danger)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>warning</span>
              Mark Damaged
            </button>
          )}

          {pipeline.current_status === 'DAMAGED' && (
            <button 
              onClick={handleMarkRepaired}
              className="water-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', borderColor: 'var(--water-success)', color: 'var(--water-success)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>check_circle</span>
              Mark Repaired
            </button>
          )}

          <button 
            onClick={() => navigate(`/water/pipelines/${id}/inspection`)}
            className="water-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'var(--water-success)', color: '#ffffff', border: 'none' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>fact_check</span>
            Record Inspection
          </button>

          <button 
            onClick={() => navigate(`/water/pipelines/${id}/maintenance`)}
            className="water-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'var(--water-warning)', color: '#ffffff', border: 'none' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>build</span>
            Schedule Maintenance
          </button>

          <button 
            onClick={handleDeletePipeline}
            className="water-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'var(--water-danger)', color: '#ffffff', border: 'none' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete</span>
            Delete
          </button>
        </div>
      </div>

      {/* Grid Layout: left metadata, right lifecycle timeline */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Left Side: General, Location, and Technical Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Card 1: General Info */}
          <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
              General Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Zone</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{pipeline.zone || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Ward</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{pipeline.ward}</span>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Area</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{pipeline.area}</span>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Street</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{pipeline.street || 'N/A'}</span>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Remarks</span>
                <span style={{ color: 'var(--water-text)' }}>{pipeline.remarks || 'No remarks provided.'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Technical Specifications */}
          <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
              Technical Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Diameter</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{pipeline.diameter ? `${pipeline.diameter} mm` : 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Length</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{pipeline.length ? `${pipeline.length} meters` : 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Material</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{pipeline.material}</span>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Installed Date</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{pipeline.installation_date || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Expected Life</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{pipeline.expected_life ? `${pipeline.expected_life} years` : 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Water Source</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{pipeline.water_source || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Pressure Level</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{pipeline.pressure_level !== null ? `${pipeline.pressure_level} psi` : 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Condition</span>
                <div style={{ marginTop: '0.2rem' }}><PipelineConditionBadge condition={pipeline.condition} /></div>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Status</span>
                <div style={{ marginTop: '0.2rem' }}><PipelineStatusBadge status={pipeline.current_status} /></div>
              </div>
            </div>
          </div>

          {/* Card 3: Route & Geolocation */}
          <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
              Route & Geolocation Info
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Start Location Point</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{pipeline.start_location || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>End Location Point</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{pipeline.end_location || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>GPS Latitude</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{pipeline.latitude || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>GPS Longitude</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{pipeline.longitude || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Timeline Lifespan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="water-card" style={{ height: '100%' }}>
            <PipelineTimeline 
              pipeline={pipeline} 
              inspections={inspections} 
              maintenances={maintenances} 
            />
          </div>
        </div>
      </div>

      {/* Historical Logs: Inspections, Maintenances, and Leak History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
        
        {/* Inspection History */}
        <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
            Inspection History Logs
          </h3>
          <InspectionTable inspections={inspections} onDelete={handleDeleteInspection} />
        </div>

        {/* Maintenance Logs */}
        <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
            Maintenance & Repairs History
          </h3>
          <MaintenanceTable maintenances={maintenances} onDelete={handleDeleteMaintenance} />
        </div>

        {/* Leak Incidents History */}
        <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
            Leak History Incidents
          </h3>
          <div style={{ width: '100%', overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid var(--water-border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--water-bg-light)', borderBottom: '2px solid var(--water-border)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Leak Date</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Reported By</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Observed Condition</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Remarks / Description</th>
                </tr>
              </thead>
              <tbody>
                {leaks.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--water-text-muted)' }}>
                      No leak incidents recorded for this pipeline.
                    </td>
                  </tr>
                ) : (
                  leaks.map((leak) => (
                    <tr key={leak.id} style={{ borderBottom: '1px solid var(--water-border)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-danger)' }}>
                        {leak.inspection_date}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {leak.inspector_name}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <PipelineConditionBadge condition={leak.condition} />
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--water-text-muted)' }}>
                        {leak.remarks || 'No remarks provided.'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
