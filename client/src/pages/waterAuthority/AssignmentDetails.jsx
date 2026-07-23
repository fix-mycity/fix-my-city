import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  getAssignmentById, 
  updateAssignment, 
  verifyAssignment,
  deleteAssignment
} from '../../services/assignmentService';
import { getWorkers } from '../../services/workerService';
import AssignmentStatusBadge from '../../components/waterAuthority/AssignmentStatusBadge';
import AssignmentTimeline from '../../components/waterAuthority/AssignmentTimeline';
import VerificationDialog from '../../components/waterAuthority/VerificationDialog';
import AssignWorkerModal from '../../components/waterAuthority/AssignWorkerModal';

export default function AssignmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState([]);
  
  // Modals state
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [deadlineOpen, setDeadlineOpen] = useState(false);
  
  // Form states
  const [newDeadline, setNewDeadline] = useState('');
  const [notes, setNotes] = useState('');

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await getAssignmentById(id);
      setAssignment(response.data);
      setNewDeadline(response.data.deadline.slice(0, 16));
      setNotes(response.data.remarks || '');
    } catch (err) {
      toast.error("Failed to retrieve work assignment details.");
      navigate('/water/assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleReassign = async (workerId, reassignNotes, priority, deadline) => {
    try {
      await updateAssignment(id, {
        worker_id: parseInt(workerId),
        remarks: reassignNotes || assignment.remarks,
        priority,
        deadline: new Date(deadline).toISOString()
      });
      toast.success("Worker successfully reassigned to task.");
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to reassign worker.");
    }
  };

  const handleDeadlineChange = async (e) => {
    e.preventDefault();
    if (!newDeadline) return;
    try {
      await updateAssignment(id, {
        deadline: new Date(newDeadline).toISOString()
      });
      toast.success("Assignment deadline rescheduled.");
      setDeadlineOpen(false);
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update deadline.");
    }
  };

  const handleSaveRemarks = async () => {
    try {
      await updateAssignment(id, { remarks: notes });
      toast.success("Internal remarks successfully updated.");
      fetchDetails();
    } catch (err) {
      toast.error("Failed to save remarks.");
    }
  };

  const handleVerifySubmit = async (status, verificationRemarks) => {
    try {
      await verifyAssignment(id, status, verificationRemarks);
      toast.success(status === 'APPROVED' ? "Work approved and marked as resolved!" : "Work rejected. Reopened assignment sent to worker.");
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Verification transaction failed.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to cancel and delete this work assignment?")) {
      try {
        await deleteAssignment(id);
        toast.success("Assignment successfully cancelled.");
        navigate('/water/assignments');
      } catch (err) {
        toast.error("Failed to delete assignment.");
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <span className="material-symbols-outlined animate-spin" style={{ fontSize: '3rem', color: 'var(--water-primary-light)' }}>
          autorenew
        </span>
      </div>
    );
  }

  if (!assignment) return null;

  const isCompleted = assignment.status === 'COMPLETED';
  const isVerified = assignment.status === 'VERIFIED';
  const isOverdue = new Date(assignment.deadline) < new Date() && !isVerified;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Header Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={() => navigate('/water/assignments')}
          className="water-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: 'none', color: 'var(--water-primary-light)', fontWeight: '700', padding: 0 }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Assignments
        </button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setReassignOpen(true)}
            className="water-btn"
            disabled={isVerified}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>sync_alt</span>
            Reassign Worker
          </button>
          <button
            onClick={() => setDeadlineOpen(true)}
            className="water-btn"
            disabled={isVerified}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>calendar_today</span>
            Change Deadline
          </button>
          <button
            onClick={handleDelete}
            className="water-btn"
            disabled={isVerified}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', borderColor: 'var(--water-danger)', color: 'var(--water-danger)' }}
          >
            Cancel Order
          </button>
        </div>
      </div>

      {/* Main Info Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Side: General Info Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main Work Assignment Overview Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--water-border)',
            padding: '1.5rem',
            boxShadow: 'var(--water-shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--water-text-muted)', textTransform: 'uppercase' }}>
                  Work Assignment Details
                </span>
                <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.4rem', fontWeight: '800', color: 'var(--water-text)' }}>
                  {assignment.assignment_number}
                </h3>
              </div>
              <AssignmentStatusBadge status={assignment.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--water-text-muted)', fontWeight: '600' }}>Priority Level</span>
                <span style={{ fontWeight: '800', color: assignment.priority === 'CRITICAL' ? '#ef4444' : 'var(--water-text)' }}>
                  {assignment.priority}
                </span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--water-text-muted)', fontWeight: '600' }}>Reschedule Deadline</span>
                <span style={{ fontWeight: '700', color: isOverdue ? '#ef4444' : 'var(--water-text)' }}>
                  {new Date(assignment.deadline).toLocaleString()} {isOverdue && '(OVERDUE)'}
                </span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--water-text-muted)', fontWeight: '600' }}>Assigned Date</span>
                <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>
                  {new Date(assignment.assigned_date).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Verification Actions Banner */}
            {isCompleted && (
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.5rem'
              }}>
                <div>
                  <h4 style={{ margin: 0, color: '#166534', fontWeight: '800', fontSize: '0.9rem' }}>
                    Repair Complete - Verification Required
                  </h4>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#166534' }}>
                    Review before/after images and material logs submitted by worker below.
                  </p>
                </div>
                <button
                  onClick={() => setVerifyOpen(true)}
                  className="water-btn water-btn-primary"
                  style={{ backgroundColor: 'var(--water-success)', borderColor: 'var(--water-success)', padding: '0.5rem 1.2rem', fontSize: '0.82rem', fontWeight: '700' }}
                >
                  Verify Work Order
                </button>
              </div>
            )}
          </div>

          {/* Complaint Details Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--water-border)',
            padding: '1.5rem',
            boxShadow: 'var(--water-shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--water-text)' }}>
              Complaint & Location Details
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>Complaint Number</span>
                <strong style={{ color: 'var(--water-primary-light)' }}>{assignment.complaint?.complaint_number || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>Ward / Area</span>
                <span>{assignment.complaint?.ward || 'N/A'} / {assignment.complaint?.area || 'N/A'}</span>
              </div>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>Street Address</span>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.85rem' }}>{assignment.complaint?.address || 'N/A'}</p>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>Issue Description</span>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.85rem', color: 'var(--water-text-muted)', lineHeight: '1.4' }}>
                {assignment.complaint?.description || 'N/A'}
              </p>
            </div>

            {/* Images display */}
            {assignment.complaint?.before_image && (
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--water-text-muted)', marginBottom: '0.35rem' }}>Attached Citizen Report Images</span>
                <img 
                  src={assignment.complaint.before_image} 
                  alt="Citizen report" 
                  style={{ maxWidth: '250px', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--water-border)' }} 
                />
              </div>
            )}
          </div>

          {/* Citizen Contact Details Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--water-border)',
            padding: '1.5rem',
            boxShadow: 'var(--water-shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--water-text)' }}>
              Citizen Contact Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>Name</span>
                <span style={{ fontWeight: '600' }}>{assignment.complaint?.citizen_name || 'Anonymous'}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>Phone</span>
                <span style={{ fontWeight: '600' }}>{assignment.complaint?.phone || 'N/A'}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>Email</span>
                <span style={{ fontWeight: '600' }}>{assignment.complaint?.email || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Timeline & Worker details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Worker Profile card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--water-border)',
            padding: '1.25rem',
            boxShadow: 'var(--water-shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-text)' }}>
              Assigned Field Worker
            </h4>
            
            {assignment.worker ? (
              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                <img 
                  src={assignment.worker.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100"} 
                  alt="Worker Profile" 
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h5 style={{ margin: 0, fontSize: '0.88rem', fontWeight: '700' }}>
                    {assignment.worker.first_name} {assignment.worker.last_name}
                  </h5>
                  <span style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)', display: 'block' }}>
                    {assignment.worker.designation || 'Field Staff'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--water-primary-light)', display: 'block', fontWeight: '600' }}>
                    Specialty: {assignment.worker.skill || 'General Repairs'}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--water-text-muted)', fontSize: '0.85rem' }}>
                No worker currently assigned.
              </div>
            )}
          </div>

          {/* Internal remarks */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--water-border)',
            padding: '1.25rem',
            boxShadow: 'var(--water-shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-text)' }}>
              Authority Remarks (Internal)
            </h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add instructions, direction notes or remarks about this work assignment..."
              rows={4}
              style={{
                width: '100%',
                padding: '0.55rem',
                fontSize: '0.82rem',
                borderRadius: '8px',
                border: '1px solid var(--water-border)',
                outline: 'none',
                resize: 'none'
              }}
            />
            <button
              onClick={handleSaveRemarks}
              className="water-btn water-btn-primary"
              style={{ padding: '0.45rem', fontSize: '0.78rem', width: '100%', fontWeight: '700' }}
            >
              Save Remarks
            </button>
          </div>

          {/* Timeline Tracking */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--water-border)',
            padding: '1.25rem',
            boxShadow: 'var(--water-shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-text)' }}>
              Work Progress History
            </h4>
            <AssignmentTimeline updates={assignment.task_updates || []} />
          </div>
        </div>
      </div>

      {/* Verification Dialog Modal */}
      <VerificationDialog
        isOpen={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        onVerify={handleVerifySubmit}
        assignmentNumber={assignment.assignment_number}
      />

      {/* Change Deadline Modal */}
      {deadlineOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '360px',
            boxShadow: 'var(--water-shadow-md)',
            border: '1px solid var(--water-border)'
          }}>
            <h4 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: '800' }}>Change Deadline</h4>
            <form onSubmit={handleDeadlineChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="datetime-local"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: '8px',
                  border: '1px solid var(--water-border)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setDeadlineOpen(false)} className="water-btn">Cancel</button>
                <button type="submit" className="water-btn water-btn-primary">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reassign Worker Modal */}
      <AssignWorkerModal
        isOpen={reassignOpen}
        onClose={() => setReassignOpen(false)}
        onAssign={handleReassign}
        complaintNumber={assignment.complaint?.complaint_number || `#${assignment.complaint_id}`}
      />
    </div>
  );
}
