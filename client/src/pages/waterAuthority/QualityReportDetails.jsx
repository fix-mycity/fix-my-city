import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import QualityStatusBadge from '../../components/waterAuthority/QualityStatusBadge';
import ParameterCard from '../../components/waterAuthority/ParameterCard';
import QualityAlertCard from '../../components/waterAuthority/QualityAlertCard';
import QualityTimeline from '../../components/waterAuthority/QualityTimeline';

import { getQualityReportById } from '../../services/waterQualityService';
import { getPipelines } from '../../services/pipelineService';
import { getTanks } from '../../services/waterTankService';

export default function QualityReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [pipeline, setPipeline] = useState(null);
  const [tank, setTank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllDetails = async () => {
      setIsLoading(true);
      try {
        const response = await getQualityReportById(id);
        const data = response.data;
        setReport(data);

        // Fetch pipeline details if present
        if (data.pipeline_id) {
          try {
            const pipeRes = await getPipelines({ page: 1, page_size: 100 });
            const matchingPipe = pipeRes.data.items.find(p => p.id === data.pipeline_id);
            setPipeline(matchingPipe);
          } catch (e) {
            console.error(e);
          }
        }

        // Fetch tank details if present
        if (data.tank_id) {
          try {
            const tankRes = await getTanks({ page: 1, page_size: 100 });
            const matchingTank = tankRes.data.items.find(t => t.id === data.tank_id);
            setTank(matchingTank);
          } catch (e) {
            console.error(e);
          }
        }
      } catch (err) {
        toast.error("Failed to load quality report details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '2.5rem', color: 'var(--water-primary-light)' }}>
          autorenew
        </span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="water-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3>Water quality report not found</h3>
        <button onClick={() => navigate('/water/quality')} className="water-btn" style={{ marginTop: '1rem' }}>
          Back to list
        </button>
      </div>
    );
  }

  // Quality score label rating description helper
  const getScoreRating = (score) => {
    if (score >= 90) return { text: 'EXCELLENT', color: 'var(--water-success)' };
    if (score >= 75) return { text: 'GOOD', color: 'var(--water-primary-light)' };
    if (score >= 60) return { text: 'POOR', color: 'var(--water-warning)' };
    return { text: 'DANGEROUS', color: '#c0392b' };
  };

  const rating = getScoreRating(report.quality_score || 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header and Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={() => navigate('/water/quality')}
            className="water-btn-icon" 
            title="Back to dashboard list"
            style={{ border: '1px solid var(--water-border)', width: '36px', height: '36px', borderRadius: '8px' }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--water-text)', margin: 0 }}>
                {report.report_number}
              </h2>
              <QualityStatusBadge status={report.overall_status} />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)' }}>
              Sample Type: {report.sample_type.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => window.print()}
            className="water-btn"
            style={{ borderColor: 'var(--water-border)', color: 'var(--water-text)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>print</span>
            Print Sheet
          </button>
          <button 
            onClick={() => navigate(`/water/quality/${report.id}/edit`)}
            className="water-btn"
            style={{ backgroundColor: 'var(--water-primary)', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '700' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>edit</span>
            Modify report
          </button>
        </div>
      </div>

      {/* Grid: Quality rating score and timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Score Card details */}
        <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--water-text-muted)', textTransform: 'uppercase' }}>
            Calculated Chemical Quality Index
          </span>

          <div style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: `8px solid ${rating.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--water-text)' }}>
              {report.quality_score?.toFixed(0)}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--water-text-muted)' }}>
              / 100
            </span>
          </div>

          <div>
            <strong style={{ color: rating.color, fontSize: '1.1rem' }}>{rating.text}</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--water-text-muted)', margin: '0.25rem 0 0 0' }}>
              Score evaluated from pH, TDS, Turbidity, Fluoride, and Chlorine parameters deviations.
            </p>
          </div>
        </div>

        <QualityTimeline 
          sampleDate={report.sample_date}
          createdDate={report.created_at}
          overallStatus={report.overall_status}
          hasAlerts={report.overall_status !== 'SAFE'}
        />
      </div>

      {/* Chemical Parameters Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: 0, letterSpacing: '0.5px' }}>
          Chemical and Volumetric Analysis
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '1rem'
        }}>
          <ParameterCard name="pH Level" value={report.ph_level} unit="pH" minSafe={6.5} maxSafe={8.5} warningThreshold={0.5} />
          <ParameterCard name="Total Dissolved Solids" value={report.tds} unit="mg/L" maxSafe={500} warningThreshold={100} />
          <ParameterCard name="Turbidity" value={report.turbidity} unit="NTU" maxSafe={1.0} warningThreshold={0.2} />
          <ParameterCard name="Residual Chlorine" value={report.chlorine_level} unit="mg/L" minSafe={0.2} maxSafe={2.0} warningThreshold={0.3} />
          <ParameterCard name="Fluoride" value={report.fluoride} unit="mg/L" maxSafe={1.5} warningThreshold={0.3} />
          <ParameterCard name="Nitrate" value={report.nitrate} unit="mg/L" maxSafe={45.0} warningThreshold={5.0} />
          <ParameterCard name="Hardness" value={report.hardness} unit="mg/L" maxSafe={300} warningThreshold={50} />
          <ParameterCard name="Iron level" value={report.iron} unit="mg/L" maxSafe={0.3} warningThreshold={0.05} />
        </div>
      </div>

      {/* Physical & Biological Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
            Physical and Biological Parameters
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Bacteria Present</span>
              <span style={{ fontWeight: '700', color: report.bacteria_present ? '#c0392b' : 'var(--water-success)' }}>
                {report.bacteria_present ? 'FOUND (Coliform, etc.)' : 'None Detected (Absent)'}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Temperature</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>
                {report.temperature !== null ? `${report.temperature} °C` : 'N/A'}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Odor</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{report.odor || 'NONE'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Color</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{report.color || 'CLEAR'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Taste</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{report.taste || 'NORMAL'}</span>
            </div>
          </div>
        </div>

        <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
            Sampling Node & System Connects
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Zone / Ward</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{report.zone || 'N/A'} / {report.ward}</span>
            </div>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Area / Location</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{report.area} {report.sample_location ? `(${report.sample_location})` : ''}</span>
            </div>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Tested By (Inspector)</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{report.tested_by || 'Unspecified'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Laboratory Name</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{report.laboratory_name || 'Unspecified'}</span>
            </div>
            {pipeline && (
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Feed Pipeline Link</span>
                <span style={{ fontWeight: '700', color: 'var(--water-primary-light)' }}>{pipeline.pipeline_number}</span>
              </div>
            )}
            {tank && (
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Source Storage Tank</span>
                <span style={{ fontWeight: '700', color: 'var(--water-primary-light)' }}>{tank.tank_number}</span>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
