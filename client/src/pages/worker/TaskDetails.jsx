import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  getWorkerTaskById, 
  acceptWorkerTask, 
  rejectWorkerTask, 
  startWorkerTask,
  updateWorkerTaskProgress,
  completeWorkerTask
} from '../../services/workerTaskService';
import StatusStepper from '../../components/worker/StatusStepper';
import TaskTimeline from '../../components/worker/TaskTimeline';
import UploadProof from '../../components/worker/UploadProof';
import LocationCard from '../../components/worker/LocationCard';
import MaterialsForm from '../../components/worker/MaterialsForm';

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form toggles
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [showCompletionForm, setShowCompletionForm] = useState(false);

  // Progress/Completion form state variables
  const [remarks, setRemarks] = useState('');
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [customStatus, setCustomStatus] = useState('WORK_STARTED');

  const fetchTaskDetails = async () => {
    setLoading(true);
    try {
      const response = await getWorkerTaskById(id);
      setTask(response.data);
    } catch (err) {
      toast.error("Failed to load task details.");
      navigate('/worker/tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const handleAccept = async () => {
    try {
      await acceptWorkerTask(id, "Task accepted by field worker.");
      toast.success("Task accepted!");
      fetchTaskDetails();
    } catch (err) {
      toast.error("Failed to accept task.");
    }
  };

  const handleReject = async () => {
    const reason = window.prompt("Please provide a reason for rejecting this assignment:");
    if (reason === null) return; // cancelled
    if (!reason.trim()) {
      toast.error("Rejection reason is required.");
      return;
    }
    try {
      await rejectWorkerTask(id, reason);
      toast.success("Task assignment rejected.");
      navigate('/worker/tasks');
    } catch (err) {
      toast.error("Failed to reject task.");
    }
  };

  const handleStartTravelling = async () => {
    try {
      await updateWorkerTaskProgress(id, {
        status: "TRAVELLING",
        remarks: "Field worker is on the way to location."
      });
      toast.success("Travelling status logged.");
      fetchTaskDetails();
    } catch (err) {
      toast.error("Failed to log status.");
    }
  };

  const handleArrive = async () => {
    try {
      await updateWorkerTaskProgress(id, {
        status: "ARRIVED",
        remarks: "Worker has arrived at repair site."
      });
      toast.success("Arrived status logged.");
      fetchTaskDetails();
    } catch (err) {
      toast.error("Failed to log arrival.");
    }
  };

  const handleStartWork = async () => {
    try {
      await startWorkerTask(id, "Work started on repair site.");
      toast.success("Repair work started!");
      fetchTaskDetails();
    } catch (err) {
      toast.error("Failed to start repair work.");
    }
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateWorkerTaskProgress(id, {
        status: customStatus,
        remarks,
        latitude,
        longitude
      });
      toast.success("Task progress logged successfully.");
      setShowProgressForm(false);
      setRemarks('');
      fetchTaskDetails();
    } catch (err) {
      toast.error("Failed to post progress log.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompletionSubmit = async (e) => {
    e.preventDefault();
    if (!afterImage) {
      toast.error("Please upload an After-Work photo proof.");
      return;
    }
    setIsSubmitting(true);
    try {
      await completeWorkerTask(id, {
        status: "COMPLETED",
        completion_notes: remarks || "Repair task finished successfully.",
        before_image: beforeImage || undefined,
        after_image: afterImage,
        materials_used: materialsUsed || undefined,
        latitude: latitude || undefined,
        longitude: longitude || undefined
      });
      toast.success("Task completed! Work submitted for authority verification.");
      setShowCompletionForm(false);
      navigate('/worker/dashboard');
    } catch (err) {
      toast.error("Failed to submit completion report.");
    } finally {
      setIsSubmitting(false);
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

  if (!task) return null;

  const currentStatus = task.status;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header and Back Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={() => navigate('/worker/tasks')}
          className="water-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: 'none', color: 'var(--water-primary-light)', fontWeight: '700', padding: 0 }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Tasks Board
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)' }}>
          Order Deadline: {new Date(task.deadline).toLocaleString()}
        </span>
      </div>

      {/* Stepper Status tracker */}
      <StatusStepper currentStatus={currentStatus} />

      {/* Action Row Buttons depending on workflow status */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--water-border)',
        borderRadius: '12px',
        padding: '1rem',
        boxShadow: 'var(--water-shadow-sm)',
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <strong style={{ fontSize: '0.88rem', color: 'var(--water-text)' }}>Next Workflow Steps:</strong>
        
        {currentStatus === 'ASSIGNED' && (
          <>
            <button onClick={handleAccept} className="water-btn water-btn-primary" style={{ backgroundColor: 'var(--water-success)', borderColor: 'var(--water-success)', padding: '0.5rem 1.2rem', fontWeight: '700' }}>
              Accept Task
            </button>
            <button onClick={handleReject} className="water-btn" style={{ borderColor: 'var(--water-danger)', color: 'var(--water-danger)', padding: '0.5rem 1.2rem', fontWeight: '700' }}>
              Reject Task
            </button>
          </>
        )}

        {currentStatus === 'ACCEPTED' && (
          <>
            <button onClick={handleStartTravelling} className="water-btn water-btn-primary" style={{ padding: '0.5rem 1.2rem', fontWeight: '700' }}>
              Start Travelling
            </button>
            <button onClick={handleReject} className="water-btn" style={{ borderColor: 'var(--water-danger)', color: 'var(--water-danger)' }}>
              Reject Task
            </button>
          </>
        )}

        {currentStatus === 'TRAVELLING' && (
          <button onClick={handleArrive} className="water-btn water-btn-primary" style={{ padding: '0.5rem 1.2rem', fontWeight: '700' }}>
            Mark Arrived at Site
          </button>
        )}

        {currentStatus === 'ARRIVED' && (
          <button onClick={handleStartWork} className="water-btn water-btn-primary" style={{ padding: '0.5rem 1.2rem', fontWeight: '700' }}>
            Start Repair Work
          </button>
        )}

        {['WORK_STARTED', 'REOPENED', 'ON_HOLD'].includes(currentStatus) && (
          <>
            <button 
              onClick={() => { setShowProgressForm(!showProgressForm); setShowCompletionForm(false); }} 
              className="water-btn"
              style={{ fontWeight: '700' }}
            >
              Update Progress Log
            </button>
            <button 
              onClick={() => { setShowCompletionForm(!showCompletionForm); setShowProgressForm(false); }} 
              className="water-btn water-btn-primary"
              style={{ backgroundColor: 'var(--water-success)', borderColor: 'var(--water-success)', fontWeight: '700' }}
            >
              Submit Completion Report
            </button>
          </>
        )}

        {currentStatus === 'COMPLETED' && (
          <div style={{ color: '#166534', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span className="material-symbols-outlined">hourglass_empty</span>
            Task submitted successfully. Awaiting verification review from Municipal Authority.
          </div>
        )}

        {currentStatus === 'VERIFIED' && (
          <div style={{ color: '#047857', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span className="material-symbols-outlined">check_circle</span>
            Task verified and closed. Great job!
          </div>
        )}
      </div>

      {/* Form Area (Progress Update or Completion Form) */}
      {showProgressForm && (
        <form onSubmit={handleProgressSubmit} style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--water-border)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: 'var(--water-shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Update Task Progress</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Current Activity Status</label>
              <select
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                style={{ padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--water-border)', outline: 'none' }}
              >
                <option value="WORK_STARTED">In Progress / Active Repair</option>
                <option value="ON_HOLD">On Hold (Waiting Parts/Testing)</option>
              </select>
            </div>
            <LocationCard onLocationCapture={({ latitude, longitude }) => { setLatitude(latitude); setLongitude(longitude); }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Activity logs remarks</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Cleared pipeline blockage, pipe welding in progress..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={{ padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--water-border)', fontSize: '0.85rem', outline: 'none', resize: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowProgressForm(false)} className="water-btn">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="water-btn water-btn-primary">
              {isSubmitting ? 'Logging...' : 'Submit Progress Update'}
            </button>
          </div>
        </form>
      )}

      {showCompletionForm && (
        <form onSubmit={handleCompletionSubmit} style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--water-border)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: 'var(--water-shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--water-success)' }}>
            Task Completion Report Form
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <UploadProof label="Upload Before-Work Photo Proof (Optional)" onUpload={setBeforeImage} />
            <UploadProof label="Upload After-Work Photo Proof (Required) *" onUpload={setAfterImage} />
          </div>

          <MaterialsForm onMaterialsChange={setMaterialsUsed} />

          <LocationCard onLocationCapture={({ latitude, longitude }) => { setLatitude(latitude); setLongitude(longitude); }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '600' }}>Completion Notes / Wrap-up remarks *</label>
            <textarea
              required
              rows={4}
              placeholder="e.g. Pipe valve successfully replaced. Re-pressurized system and verified no leaks exist."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={{ padding: '0.55rem', borderRadius: '8px', border: '1px solid var(--water-border)', fontSize: '0.85rem', outline: 'none', resize: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowCompletionForm(false)} className="water-btn">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="water-btn water-btn-success" style={{ backgroundColor: 'var(--water-success)', borderColor: 'var(--water-success)', color: '#ffffff', fontWeight: '700' }}>
              {isSubmitting ? 'Submitting...' : 'Submit Completion Report'}
            </button>
          </div>
        </form>
      )}

      {/* Columns display for details */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left side: Task info card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--water-border)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: 'var(--water-shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--water-text)' }}>
              Repair Task & Location Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>Complaint Title</span>
                <strong style={{ color: 'var(--water-primary-light)' }}>{task.complaint?.title || 'Pipe Leakage Repair'}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>Area / Ward</span>
                <span>{task.complaint?.area || 'N/A'} / {task.complaint?.ward || 'N/A'}</span>
              </div>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>Location Address</span>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.85rem' }}>{task.complaint?.address || 'N/A'}</p>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>Citizen Issue Description</span>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.85rem', color: 'var(--water-text-muted)', lineHeight: '1.4' }}>
                {task.complaint?.description || 'No description provided.'}
              </p>
            </div>

            {/* Images */}
            {task.complaint?.before_image && (
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--water-text-muted)', marginBottom: '0.3rem' }}>Attached Issue Images</span>
                <img 
                  src={task.complaint.before_image} 
                  alt="Complaint issue" 
                  style={{ maxWidth: '250px', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--water-border)' }} 
                />
              </div>
            )}
          </div>

          {/* Citizen Details */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--water-border)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: 'var(--water-shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--water-text)' }}>
              Citizen Contact Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>Citizen Name</span>
                <span style={{ fontWeight: '600' }}>{task.complaint?.citizen_name || 'Anonymous Citizen'}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>Citizen Phone</span>
                <span style={{ fontWeight: '600' }}>{task.complaint?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: remarks and timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Notes from Authority */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--water-border)',
            borderRadius: '16px',
            padding: '1.25rem',
            boxShadow: 'var(--water-shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-text)' }}>
              Authority Assignment Notes
            </h4>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--water-text-muted)', lineHeight: '1.4' }}>
              {task.remarks || 'No notes left by supervisor.'}
            </p>
          </div>

          {/* Timeline tracker */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--water-border)',
            borderRadius: '16px',
            padding: '1.25rem',
            boxShadow: 'var(--water-shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <TaskTimeline updates={task.task_updates || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
