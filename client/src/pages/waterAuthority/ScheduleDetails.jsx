import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import ScheduleStatusBadge from '../../components/waterAuthority/ScheduleStatusBadge';
import SupplyTimeline from '../../components/waterAuthority/SupplyTimeline';
import PauseScheduleDialog from '../../components/waterAuthority/PauseScheduleDialog';
import ResumeScheduleDialog from '../../components/waterAuthority/ResumeScheduleDialog';

import {
  getSupplyScheduleById,
  pauseSupplySchedule,
  resumeSupplySchedule,
  deleteSupplySchedule,
  updateSupplySchedule
} from '../../services/waterSupplyService';

export default function ScheduleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [isPauseOpen, setIsPauseOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  const fetchDetails = async () => {
    setIsLoading(true);
    try {
      const response = await getSupplyScheduleById(id);
      setSchedule(response.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not retrieve schedule details.");
      navigate('/water/supply');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  const handlePauseConfirm = async (id, remarks) => {
    try {
      const response = await pauseSupplySchedule(id, remarks);
      setSchedule(response.data);
      toast.success("Water supply schedule paused.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to pause schedule.");
    }
  };

  const handleResumeConfirm = async (id, remarks) => {
    try {
      const response = await resumeSupplySchedule(id, remarks);
      setSchedule(response.data);
      toast.success("Water supply schedule resumed.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to resume schedule.");
    }
  };

  const handleCancelSchedule = async () => {
    const reason = window.prompt("Enter reason for emergency cancellation:");
    if (reason === null) return; // user cancelled prompt
    
    try {
      // Direct patch to status CANCELLED
      const response = await updateSupplySchedule(id, { status: "CANCELLED", remarks: reason });
      setSchedule(response.data);
      toast.success("Water supply schedule cancelled (Emergency Interruption).");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to cancel schedule.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this schedule permanently?")) {
      try {
        await deleteSupplySchedule(id);
        toast.success("Schedule deleted successfully!");
        navigate('/water/supply');
      } catch (err) {
        toast.error(err.response?.data?.detail || "Failed to delete schedule.");
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

  if (!schedule) return null;

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={() => navigate('/water/supply')}
          className="water-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: 'none', color: 'var(--water-primary-light)', fontWeight: '700', padding: 0 }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Supply Schedules
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)' }}>
          Last updated: {new Date(schedule.updated_at).toLocaleString()}
        </span>
      </div>

      {/* Main Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--water-text)' }}>
            Schedule: {schedule.schedule_number}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--water-text-muted)', marginTop: '0.2rem' }}>
            Zone: <strong>{schedule.zone || 'N/A'}</strong> | Type: <strong>{schedule.supply_type}</strong>
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate(`/water/supply/${schedule.id}/edit`)}
            className="water-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', borderColor: 'var(--water-primary-light)', color: 'var(--water-primary-light)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>edit</span>
            Modify
          </button>

          {schedule.status === 'ACTIVE' && (
            <button 
              onClick={() => setIsPauseOpen(true)}
              className="water-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', borderColor: 'var(--water-warning)', color: 'var(--water-warning)', fontWeight: '700' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>pause_circle</span>
              Pause Supply
            </button>
          )}

          {schedule.status === 'PAUSED' && (
            <button 
              onClick={() => setIsResumeOpen(true)}
              className="water-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', borderColor: 'var(--water-success)', color: 'var(--water-success)', fontWeight: '700' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>play_circle</span>
              Resume Supply
            </button>
          )}

          {schedule.status !== 'CANCELLED' && schedule.status !== 'COMPLETED' && (
            <button 
              onClick={handleCancelSchedule}
              className="water-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', borderColor: 'var(--water-danger)', color: 'var(--water-danger)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>dangerous</span>
              Emergency Interruption
            </button>
          )}

          <button 
            onClick={handleDelete}
            className="water-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: 'var(--water-danger)', color: '#ffffff', border: 'none' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete</span>
            Delete
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Left Side: Schedule Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Card 1: Location & Details */}
          <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
              Location & Supply Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Ward</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{schedule.ward}</span>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Area</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{schedule.area}</span>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Street</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{schedule.street || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Supply Date</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{schedule.supply_date}</span>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Duration</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{schedule.duration_minutes ? `${schedule.duration_minutes} Minutes` : 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Status</span>
                <div style={{ marginTop: '0.2rem' }}><ScheduleStatusBadge status={schedule.status} /></div>
              </div>
            </div>
          </div>

          {/* Card 2: Timings */}
          <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
              Distribution Windows
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Morning Supply Start</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{formatTime(schedule.morning_start_time)}</span>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Morning Supply End</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{formatTime(schedule.morning_end_time)}</span>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Evening Supply Start</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{formatTime(schedule.evening_start_time)}</span>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Evening Supply End</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{formatTime(schedule.evening_end_time)}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Source & Infrastructure */}
          <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
              Infrastructure & Source Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Water Source</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{schedule.water_source || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Pipeline</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{schedule.pipeline_name || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--water-text-muted)', display: 'block', fontSize: '0.75rem' }}>Tank</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{schedule.tank_name || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Remarks */}
          <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
              Remarks & Instructions
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--water-text)', margin: '0.25rem 0 0 0', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
              {schedule.remarks || 'No remarks or instructions provided.'}
            </p>
          </div>
        </div>

        {/* Right Side: Timeline and Status History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="water-card" style={{ height: '100%' }}>
            <SupplyTimeline schedule={schedule} />
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <PauseScheduleDialog 
        isOpen={isPauseOpen}
        onClose={() => setIsPauseOpen(false)}
        onConfirm={handlePauseConfirm}
        schedule={schedule}
      />
      <ResumeScheduleDialog 
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
        onConfirm={handleResumeConfirm}
        schedule={schedule}
      />
    </div>
  );
}
