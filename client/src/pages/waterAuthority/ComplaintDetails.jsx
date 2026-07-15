import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import ComplaintTimeline from '../../components/waterAuthority/ComplaintTimeline';
import ComplaintDetailsCard from '../../components/waterAuthority/ComplaintDetailsCard';
import ComplaintInfo from '../../components/waterAuthority/ComplaintInfo';
import ComplaintImages from '../../components/waterAuthority/ComplaintImages';
import InternalNotes from '../../components/waterAuthority/InternalNotes';
import AssignWorkerModal from '../../components/waterAuthority/AssignWorkerModal';
import StatusUpdateModal from '../../components/waterAuthority/StatusUpdateModal';

import { 
  getComplaintById, 
  updateComplaintStatus, 
  assignWorker, 
  updateComplaint 
} from '../../services/waterComplaintService';

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Modals
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const fetchComplaintDetails = async () => {
    setIsLoading(true);
    try {
      const response = await getComplaintById(id);
      setComplaint(response.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not retrieve complaint details.");
      navigate('/water/complaints');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchComplaintDetails();
    }
  }, [id]);

  const handleUpdateStatus = async (status, notes = "") => {
    try {
      const response = await updateComplaintStatus(id, status, notes);
      setComplaint(response.data);
      toast.success(`Complaint status transitioned to ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update status.");
    }
  };

  const handleAssignWorkerSubmit = async (workerId, notes = "") => {
    try {
      const response = await assignWorker(id, workerId, notes);
      setComplaint(response.data);
      toast.success(`Worker assigned successfully.`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to assign worker.");
    }
  };

  const handleSaveNotes = async (notes) => {
    setIsSavingNotes(true);
    try {
      // Partially update complaint notes
      const response = await updateComplaint(id, { authority_notes: notes });
      setComplaint(response.data);
      toast.success("Internal notes updated successfully.");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save internal notes.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleApprove = () => handleUpdateStatus("ACCEPTED", "Complaint accepted upon office verification");
  const handleReject = () => {
    const reason = window.prompt("Provide rejection reason:");
    if (reason === null) return;
    handleUpdateStatus("REJECTED", reason || "Rejected by authority");
  };
  const handleClose = () => {
    if (window.confirm("Are you sure you want to close this complaint?")) {
      handleUpdateStatus("CLOSED", "Resolved and closed by authority");
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <span className="material-symbols-outlined animate-spin" style={{ fontSize: '3rem', color: 'var(--water-primary-light)' }}>
          autorenew
        </span>
      </div>
    );
  }

  if (!complaint) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Header Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={() => navigate('/water/complaints')}
          className="water-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: 'none', color: 'var(--water-primary-light)', fontWeight: '700', padding: 0 }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Registry
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)' }}>
          Last updated: {new Date(complaint.updated_at).toLocaleString()}
        </span>
      </div>

      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--water-text)' }}>
            Complaint: {complaint.complaint_number}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--water-text-muted)', marginTop: '0.2rem' }}>
            Registered on {new Date(complaint.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Dynamic Actions Row */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {complaint.status === 'NEW' && (
            <>
              <button onClick={handleApprove} className="water-btn" style={{ borderColor: 'var(--water-success)', color: 'var(--water-success)', fontWeight: '700' }}>
                <span className="material-symbols-outlined">check</span> Accept
              </button>
              <button onClick={handleReject} className="water-btn" style={{ borderColor: 'var(--water-danger)', color: 'var(--water-danger)', fontWeight: '700' }}>
                <span className="material-symbols-outlined">close</span> Reject
              </button>
            </>
          )}

          {complaint.status === 'ACCEPTED' && (
            <button onClick={() => setIsAssignOpen(true)} className="water-btn water-btn-primary">
              <span className="material-symbols-outlined">person_add</span> Assign Worker
            </button>
          )}

          {complaint.status !== 'CLOSED' && (
            <button onClick={() => setIsStatusOpen(true)} className="water-btn" style={{ borderColor: 'var(--water-warning)', color: 'var(--water-warning)', fontWeight: '700' }}>
              <span className="material-symbols-outlined">edit_note</span> Update Status
            </button>
          )}

          {complaint.status !== 'CLOSED' && (
            <button onClick={handleClose} className="water-btn" style={{ backgroundColor: 'var(--water-danger)', color: '#ffffff', borderColor: 'var(--water-danger)', fontWeight: '700' }}>
              <span className="material-symbols-outlined">lock</span> Close Complaint
            </button>
          )}
        </div>
      </div>

      {/* Progress Timeline */}
      <ComplaintTimeline currentStatus={complaint.status} />

      {/* Layout Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '1.5rem'
      }}>
        
        {/* Left Side Info (8 Columns) */}
        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <ComplaintInfo complaint={complaint} />
          
          <ComplaintImages 
            beforeImage={complaint.before_image} 
            afterImage={complaint.after_image} 
          />
        </div>

        {/* Right Side Details & Notes (4 Columns) */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <ComplaintDetailsCard complaint={complaint} />
          
          <InternalNotes 
            authorityNotes={complaint.authority_notes}
            resolutionNotes={complaint.resolution_notes}
            onSaveNotes={handleSaveNotes}
            isSaving={isSavingNotes}
          />
        </div>

      </div>

      {/* Worker Assign modal */}
      <AssignWorkerModal 
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        onAssign={handleAssignWorkerSubmit}
        complaintNumber={complaint.complaint_number}
      />

      {/* Status Update modal */}
      <StatusUpdateModal 
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        onUpdate={handleUpdateStatus}
        complaint={complaint}
      />
    </div>
  );
}
