import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { toastConfirm } from '../../utils/toastConfirm';

import { StatusBadge, PriorityBadge } from '../../components/wasteManagement/StatusBadge';
import { ComplaintStatusTimeline, ComplaintTimeline } from '../../components/wasteManagement/ComplaintTimeline';
import AssignWorkerModal from '../../components/wasteManagement/AssignWorkerModal';
import StatusUpdateModal from '../../components/wasteManagement/StatusUpdateModal';
import LoadingSkeleton from '../../components/wasteManagement/LoadingSkeleton';

import { 
  getWasteComplaintById, 
  updateWasteComplaintStatus, 
  assignWasteComplaintWorker,
  updateWasteComplaint 
} from '../../services/wasteManagementService';

import ComplaintImages from '../../components/wasteManagement/ComplaintImages';

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [internalNotes, setInternalNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Modals
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const defaultPlaceholder = "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=600";
  const resolutionPlaceholder = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600";

  const fetchComplaintDetails = async () => {
    setLoading(true);
    try {
      const res = await getWasteComplaintById(id);
      setComplaint(res.data);
      setInternalNotes(res.data?.authority_notes || '');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load waste complaint details.');
      navigate('/waste/complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchComplaintDetails();
    }
  }, [id]);

  const handleUpdateStatusSubmit = async (status, notes = '') => {
    try {
      const res = await updateWasteComplaintStatus(id, status, notes);
      setComplaint(res.data);
      toast.success(`Complaint status transitioned to ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update complaint status.');
    }
  };

  const handleAssignWorkerSubmit = async (workerId, notes = "", priority = "MEDIUM", deadline = "") => {
    try {
      await createAssignment({
        complaint_id: parseInt(id),
        worker_id: parseInt(workerId),
        deadline: deadline ? new Date(deadline).toISOString() : new Date().toISOString(),
        priority,
        remarks: notes || `Assigned for complaint #${complaint?.complaint_number || id}`
      });
      await assignWasteComplaintWorker(id, workerId, notes);
      const res = await getWasteComplaintById(id);
      setComplaint(res.data);
      toast.success(`Worker assigned successfully via Work Assignment workflow.`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to assign worker.');
    }
  };

  const handleApprove = () => handleUpdateStatusSubmit('ACCEPTED', 'Complaint accepted upon office verification');
  
  const handleReject = () => {
    const reason = window.prompt('Provide rejection reason:');
    if (reason === null) return;
    handleUpdateStatusSubmit('REJECTED', reason || 'Rejected by waste authority');
  };

  const handleClose = () => {
    toastConfirm('Are you sure you want to close this waste complaint?', () => {
      handleUpdateStatusSubmit('CLOSED', 'Resolved and closed by waste authority');
    });
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const res = await updateWasteComplaint(id, { authority_notes: internalNotes });
      setComplaint(res.data);
      toast.success('Internal operational notes saved successfully.');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save operational notes.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (loading || !complaint) {
    return <LoadingSkeleton />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      
      {/* Top Header Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => navigate('/waste/complaints')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            border: 'none',
            background: 'none',
            color: '#059669',
            fontWeight: '700',
            fontSize: '0.9rem',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Complaints Registry
        </button>
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Last updated: {new Date(complaint.updated_at || complaint.created_at).toLocaleString()}
        </span>
      </div>

      {/* Title Header with Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Complaint: {complaint.complaint_number}
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.2rem' }}>
            Registered on {new Date(complaint.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Dynamic Actions Row */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {(complaint.status === 'PENDING' || complaint.status === 'NEW') && (
            <>
              <button
                onClick={handleApprove}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1.5px solid #059669',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span>
                Accept
              </button>

              <button
                onClick={handleReject}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1.5px solid #ef4444',
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                Reject
              </button>
            </>
          )}

          {(complaint.status === 'ACCEPTED' || complaint.status === 'PENDING') && (
            <button
              onClick={() => setIsAssignOpen(true)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#059669',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
              Assign Worker
            </button>
          )}

          {complaint.status !== 'CLOSED' && (
            <button
              onClick={() => setIsStatusOpen(true)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1.5px solid #f59e0b',
                backgroundColor: '#fffbeb',
                color: '#d97706',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit_note</span>
              Update Status
            </button>
          )}

          {complaint.status !== 'CLOSED' && (
            <button
              onClick={handleClose}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>lock</span>
              Close Complaint
            </button>
          )}
        </div>
      </div>

      {/* Progress Timeline */}
      <ComplaintStatusTimeline currentStatus={complaint.status} />

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '1.5rem' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Citizen & Report Details Card */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1.2rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#059669' }}>person</span>
              Citizen & Report Details
            </h3>

            <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '1rem', border: '1px solid #e2e8f0', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>account_circle</span>
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>{complaint.citizen_name || 'Anonymous Citizen'}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>call</span>
                  {complaint.phone || 'No phone provided'}
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
                {complaint.title}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.6' }}>
                {complaint.description || 'No detailed description provided by citizen.'}
              </div>
            </div>
          </div>

          {/* Operational Images Comparisons Card */}
          <ComplaintImages 
            beforeImage={complaint.before_image} 
            afterImage={complaint.after_image} 
          />

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Location & Category Card */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#059669', fontSize: '20px' }}>location_on</span>
              Location & Category
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Ward / Area:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
                  {complaint.ward || 'N/A'} • {complaint.area || 'N/A'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Address Description:</div>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                  {complaint.address || 'No address logged.'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Coordinates:</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                  {complaint.latitude ? `${Number(complaint.latitude).toFixed(5)}, ${Number(complaint.longitude).toFixed(5)}` : 'N/A'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Category:</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#059669' }}>
                  {complaint.category}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Reported Priority:</span>
                <PriorityBadge priority={complaint.priority} />
              </div>
            </div>
          </div>

          {/* Assigned Field Staff Card */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                Assigned Field Staff
              </h3>
              <button
                onClick={() => setIsAssignOpen(true)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.78rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person_add</span>
                Assign
              </button>
            </div>

            {complaint.assigned_worker_name ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#059669', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                  {complaint.assigned_worker_name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a' }}>{complaint.assigned_worker_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#047857' }}>{complaint.assigned_worker_phone || 'Sanitation Worker'}</div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', padding: '0.4rem 0' }}>
                No worker currently assigned.
              </div>
            )}
          </div>

          {/* Internal & Operational Notes Card */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.85rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#059669', fontSize: '20px' }}>note_alt</span>
              Internal & Operational Notes
            </h3>

            <textarea
              rows="3"
              placeholder="Add internal operational notes or dispatch instructions..."
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none',
                resize: 'vertical',
                marginBottom: '0.75rem'
              }}
            />

            <button
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                color: '#334155',
                fontWeight: '700',
                fontSize: '0.82rem',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem'
              }}
            >
              {isSavingNotes ? 'Saving Notes...' : 'Save Operational Notes'}
            </button>
          </div>

          {/* Complaint Timeline Audit Log */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#059669', fontSize: '20px' }}>history</span>
              Complaint Timeline Audit Log
            </h3>

            <ComplaintTimeline history={complaint.history} />
          </div>

        </div>
      </div>

      {/* Modals */}
      <AssignWorkerModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        onAssign={handleAssignWorkerSubmit}
        complaintNumber={complaint.complaint_number}
        complaint={complaint}
        onSuccess={fetchComplaintDetails}
      />

      <StatusUpdateModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        onUpdate={handleUpdateStatusSubmit}
        complaint={complaint}
        onSuccess={fetchComplaintDetails}
      />
    </div>
  );
}
