import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import EmergencyStatusBadge from '../../components/waterAuthority/EmergencyStatusBadge';
import EmergencyPriorityBadge from '../../components/waterAuthority/EmergencyPriorityBadge';
import AffectedAreaTable from '../../components/waterAuthority/AffectedAreaTable';
import ResponseTeamTable from '../../components/waterAuthority/ResponseTeamTable';
import EmergencyTimeline from '../../components/waterAuthority/EmergencyTimeline';
import EmergencyNotificationCard from '../../components/waterAuthority/EmergencyNotificationCard';
import RestoreSupplyDialog from '../../components/waterAuthority/RestoreSupplyDialog';

import { getEmergency, updateEmergency, getEmergencyTimeline } from '../../services/emergencyService';
import { getEmergencyTeam, assignEmergencyTeam } from '../../services/emergencyTeamService';
import { createEmergencyNotification } from '../../services/emergencyNotificationService';
import { getWorkers } from '../../services/workerService';

export default function EmergencyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [emergency, setEmergency] = useState(null);
  const [team, setTeam] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Status transitions modal states
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusModalTitle, setStatusModalTitle] = useState('');
  const [targetStatus, setTargetStatus] = useState('');

  // Assign worker states
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [workerRole, setWorkerRole] = useState('LEAD_REPAIR');

  const fetchAllData = async () => {
    try {
      const emRes = await getEmergency(id);
      setEmergency(emRes.data);

      const teamRes = await getEmergencyTeam(id);
      setTeam(teamRes.data);

      const timeRes = await getEmergencyTimeline(id);
      setTimeline(timeRes.data);

      const workerRes = await getWorkers();
      setWorkers(workerRes.data.workers || []);
    } catch (err) {
      toast.error("Failed to load emergency incident details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchAllData();
  }, [id]);

  const handleOpenStatusModal = (statusVal, title) => {
    setTargetStatus(statusVal);
    setStatusModalTitle(title);
    setIsStatusModalOpen(true);
  };

  const handleStatusUpdateConfirm = async (remarks) => {
    try {
      await updateEmergency(id, {
        status: targetStatus,
        remarks: remarks
      });
      toast.success(`Incident transitioned to ${targetStatus}`);
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid status transition.");
    }
  };

  const handleAssignWorkerSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWorkerId) {
      alert("Please select a worker to assign.");
      return;
    }

    try {
      await assignEmergencyTeam(id, {
        worker_id: parseInt(selectedWorkerId),
        role: workerRole,
        status: 'ASSIGNED'
      });
      toast.success("Worker assigned to emergency response team!");
      setSelectedWorkerId('');
      fetchAllData();
    } catch (err) {
      toast.error("Failed to assign worker.");
    }
  };

  const handleSendBroadcast = async (notifData) => {
    try {
      await createEmergencyNotification(id, notifData);
      toast.success("Broadcast dispatched successfully!");
      fetchAllData();
    } catch (err) {
      toast.error("Failed to dispatch alert.");
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '2.5rem', color: 'var(--water-primary-light)' }}>
          autorenew
        </span>
      </div>
    );
  }

  if (!emergency) {
    return (
      <div className="water-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3>Emergency incident not found</h3>
        <button onClick={() => navigate('/water/emergency')} className="water-btn" style={{ marginTop: '1rem' }}>
          Back to control center
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header and Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={() => navigate('/water/emergency')}
            className="water-btn-icon" 
            title="Back to dashboard list"
            style={{ border: '1px solid var(--water-border)', width: '36px', height: '36px', borderRadius: '8px' }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--water-text)', margin: 0 }}>
                {emergency.shutdown_number}
              </h2>
              <EmergencyStatusBadge status={emergency.status} />
              <EmergencyPriorityBadge priority={emergency.priority} />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)' }}>
              Type: {emergency.emergency_type.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Quick status dropdown transitions changer */}
          {emergency.status !== 'CLOSED' && (
            <>
              {emergency.status !== 'SUPPLY_STOPPED' && (
                <button 
                  onClick={() => handleOpenStatusModal('SUPPLY_STOPPED', 'Isolate Water Supply Flow')}
                  className="water-btn"
                  style={{ backgroundColor: '#9b59b6', color: '#ffffff', border: 'none', fontSize: '0.8rem', fontWeight: 'bold' }}
                >
                  Stop Water Flow
                </button>
              )}
              {emergency.status !== 'RESTORED' && (
                <button 
                  onClick={() => handleOpenStatusModal('RESTORED', 'Restore Water Supply Service')}
                  className="water-btn"
                  style={{ backgroundColor: 'var(--water-success)', color: '#ffffff', border: 'none', fontSize: '0.8rem', fontWeight: 'bold' }}
                >
                  Restore Supply
                </button>
              )}
              <button 
                onClick={() => handleOpenStatusModal('CLOSED', 'Close Emergency Incident')}
                className="water-btn"
                style={{ backgroundColor: 'var(--water-danger)', color: '#ffffff', border: 'none', fontSize: '0.8rem', fontWeight: 'bold' }}
              >
                Close Incident
              </button>
            </>
          )}

          <button 
            onClick={() => navigate(`/water/emergency/${emergency.id}/edit`)}
            className="water-btn"
            style={{ borderColor: 'var(--water-border)', color: 'var(--water-text)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '700' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>edit</span>
            Modify
          </button>
        </div>
      </div>

      {/* General info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Spec profile */}
        <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
            General Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Incident Title</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{emergency.title}</span>
            </div>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Emergency Type</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{emergency.emergency_type.replace(/_/g, ' ')}</span>
            </div>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Zone / Ward / Area</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{emergency.zone || 'N/A'} / {emergency.ward} / {emergency.area}</span>
            </div>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Supervisor Assigned</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{emergency.assigned_supervisor || 'Unassigned'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Affected Pipeline</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>
                {emergency.pipeline_number ? `Pipeline #${emergency.pipeline_number}` : 'None'}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Affected Water Tank</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>
                {emergency.tank_number ? `Tank #${emergency.tank_number}` : 'None'}
              </span>
            </div>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Detailed Reason / Cause</span>
            <p style={{ margin: '0.2rem 0 0 0', lineHeight: '1.4' }}>{emergency.description || 'No description provided.'}</p>
          </div>
        </div>

        {/* Timelines and restore dates */}
        <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
            Incident Chronology
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Shutdown Triggered</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{new Date(emergency.shutdown_start).toLocaleString()}</span>
            </div>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Expected Restore</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{emergency.expected_restore_time ? new Date(emergency.expected_restore_time).toLocaleString() : 'N/A'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Actual Supply Restoration</span>
              <span style={{ fontWeight: '700', color: 'var(--water-success)' }}>
                {emergency.actual_restore_time ? new Date(emergency.actual_restore_time).toLocaleString() : 'Pending Restoration'}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Broadcasts Dispatched</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>
                {emergency.citizen_notification_sent ? 'Yes, Citizens Notified' : 'No notification issued'}
              </span>
            </div>
          </div>
          {emergency.remarks && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Closing Remarks</span>
              <p style={{ margin: '0.2rem 0 0 0', fontStyle: 'italic' }}>{emergency.remarks}</p>
            </div>
          )}
        </div>
      </div>

      {/* Affected Area tables */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: 0, letterSpacing: '0.5px' }}>
          Impacted Areas & population details
        </h4>
        <AffectedAreaTable areas={emergency.affected_areas} />
      </div>

      {/* Roster crew list and assign form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* Assign form */}
        {emergency.status !== 'CLOSED' && (
          <form onSubmit={handleAssignWorkerSubmit} className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
              Dispatch Emergency Responder
            </h3>

            <div>
              <label className="water-label">Choose Field Worker *</label>
              <select 
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="water-input"
                required
              >
                <option value="">Select worker...</option>
                {workers.map(w => (
                  <option key={w.id} value={w.id}>{w.first_name} {w.last_name} ({w.skill || 'Staff'})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="water-label">Role in Emergency Team</label>
              <select 
                value={workerRole} 
                onChange={(e) => setWorkerRole(e.target.value)}
                className="water-input"
              >
                <option value="LEAD_REPAIR">Lead Repair Welder</option>
                <option value="VALVE_OPERATOR">Valve Isolation Operator</option>
                <option value="SAFETY_OFFICER">Site Safety Officer</option>
                <option value="EXCAVATION_TECH">Excavation Technician</option>
                <option value="SUPERVISOR">Supervisor Dispatcher</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="water-btn"
              style={{ backgroundColor: 'var(--water-primary)', color: '#ffffff', border: 'none', fontWeight: '700' }}
            >
              Assign to Team
            </button>
          </form>
        )}

        {/* Crew roster table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: 0, letterSpacing: '0.5px' }}>
            Assigned Response Team Roster
          </h4>
          <ResponseTeamTable team={team} />
        </div>
      </div>

      {/* Timeline logs & notification card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'flex-start' }}>
        <EmergencyTimeline timelines={timeline} />
        <EmergencyNotificationCard 
          notifications={emergency.notifications} 
          onSendNotification={handleSendBroadcast} 
        />
      </div>

      {/* Status Transition Dialog */}
      <RestoreSupplyDialog 
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSubmit={handleStatusUpdateConfirm}
        title={statusModalTitle}
      />

    </div>
  );
}
