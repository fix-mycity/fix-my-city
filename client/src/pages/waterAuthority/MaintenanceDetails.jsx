import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import MaintenanceStatusBadge from '../../components/waterAuthority/MaintenanceStatusBadge';
import PriorityBadge from '../../components/waterAuthority/PriorityBadge';
import TaskTable from '../../components/waterAuthority/TaskTable';
import MaterialTable from '../../components/waterAuthority/MaterialTable';
import MaterialForm from '../../components/waterAuthority/MaterialForm';
import PhotoGallery from '../../components/waterAuthority/PhotoGallery';
import PhotoUpload from '../../components/waterAuthority/PhotoUpload';
import MaintenanceTimeline from '../../components/waterAuthority/MaintenanceTimeline';
import CostSummaryCard from '../../components/waterAuthority/CostSummaryCard';

import { getMaintenance, updateMaintenance, uploadPhoto, getMaintenanceHistory } from '../../services/maintenanceService';
import { getMaintenanceTasks, updateMaintenanceTask } from '../../services/maintenanceTaskService';
import { getMaintenanceMaterials, addMaintenanceMaterial } from '../../services/maintenanceMaterialService';
import { getWorkers } from '../../services/workerService';

export default function MaintenanceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [maint, setMaint] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [history, setHistory] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals / forms states
  const [isMaterialFormOpen, setIsMaterialFormOpen] = useState(false);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const maintRes = await getMaintenance(id);
      setMaint(maintRes.data);
      setPhotos(maintRes.data.photos || []);
    } catch (err) {
      toast.error("Failed to load maintenance details.");
      navigate('/water/maintenance');
      setIsLoading(false);
      return;
    }

    try {
      const taskRes = await getMaintenanceTasks(id);
      setTasks(Array.isArray(taskRes.data) ? taskRes.data : []);
    } catch (_tErr) {
      setTasks([]);
    }

    try {
      const matRes = await getMaintenanceMaterials(id);
      setMaterials(Array.isArray(matRes.data) ? matRes.data : []);
    } catch (_mErr) {
      setMaterials([]);
    }

    try {
      const histRes = await getMaintenanceHistory(id);
      setHistory(Array.isArray(histRes.data) ? histRes.data : []);
    } catch (_hErr) {
      setHistory([]);
    }

    try {
      const workerRes = await getWorkers();
      setWorkers(Array.isArray(workerRes.data?.items) ? workerRes.data.items : (Array.isArray(workerRes.data) ? workerRes.data : []));
    } catch (_wErr) {
      setWorkers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchAllData();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      await updateMaintenance(id, { status: newStatus });
      toast.success("Maintenance status updated successfully.");
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid status transition.");
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await updateMaintenanceTask(taskId, { status: newStatus });
      toast.success("Task status updated.");
      fetchAllData();
    } catch (err) {
      toast.error("Failed to update task status.");
    }
  };

  const handleAddMaterial = async (materialData) => {
    try {
      await addMaintenanceMaterial(id, materialData);
      toast.success("Material added successfully!");
      fetchAllData();
    } catch (err) {
      toast.error("Failed to record material usage.");
    }
  };

  const handlePhotoUpload = async (photoData) => {
    try {
      await uploadPhoto(id, photoData);
      toast.success("Photo uploaded successfully!");
      fetchAllData();
    } catch (err) {
      toast.error("Failed to upload photo URL.");
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

  if (!maint) {
    return (
      <div className="water-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3>Maintenance job not found</h3>
        <button onClick={() => navigate('/water/maintenance')} className="water-btn" style={{ marginTop: '1rem' }}>
          Back to dashboard
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
            onClick={() => navigate('/water/maintenance')}
            className="water-btn-icon" 
            title="Back to dashboard list"
            style={{ border: '1px solid var(--water-border)', width: '36px', height: '36px', borderRadius: '8px' }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--water-text)', margin: 0 }}>
                {maint.maintenance_number}
              </h2>
              <MaintenanceStatusBadge status={maint.status} />
              <PriorityBadge priority={maint.priority} />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)' }}>
              Type: {maint.maintenance_type.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Quick status dropdown transitions changer */}
          <select 
            value={maint.status} 
            onChange={(e) => handleStatusChange(e.target.value)}
            className="water-input"
            style={{ width: 'auto', padding: '0.35rem 0.5rem', fontSize: '0.8rem', fontWeight: 'bold' }}
          >
            <option value="" disabled>Change Status</option>
            <option value="PENDING">PENDING</option>
            <option value="SCHEDULED">SCHEDULED</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="WAITING_PARTS">WAITING PARTS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <button 
            onClick={() => navigate(`/water/maintenance/${maint.id}/edit`)}
            className="water-btn"
            style={{ backgroundColor: 'var(--water-primary)', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '700' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>edit</span>
            Modify
          </button>
        </div>
      </div>

      {/* Costs analysis and timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <CostSummaryCard estimated={maint.estimated_cost} actual={maint.actual_cost} />
        <MaintenanceTimeline histories={history} />
      </div>

      {/* General info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
            General Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Title</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{maint.title}</span>
            </div>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Source</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{maint.source_type} {maint.source_reference_id ? `#${maint.source_reference_id}` : ''}</span>
            </div>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Zone / Ward / Area</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{maint.zone || 'N/A'} / {maint.ward} / {maint.area}</span>
            </div>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Supervisor</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{maint.assigned_supervisor || 'Unassigned'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Assigned Team</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{maint.assigned_team || 'None'}</span>
            </div>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Description</span>
            <p style={{ margin: '0.2rem 0 0 0', lineHeight: '1.4' }}>{maint.description || 'No description provided.'}</p>
          </div>
        </div>

        <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
            Operational Dates
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Scheduled Date</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{maint.scheduled_date || 'N/A'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Expected Completion</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{maint.expected_completion || 'N/A'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Actual Start Date</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{maint.start_date || 'N/A'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Actual Completion</span>
              <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{maint.completed_date || 'N/A'}</span>
            </div>
          </div>
          {maint.remarks && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Remarks</span>
              <p style={{ margin: '0.2rem 0 0 0', fontStyle: 'italic' }}>{maint.remarks}</p>
            </div>
          )}
        </div>
      </div>

      {/* Task Breakdowns */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: 0, letterSpacing: '0.5px' }}>
            Task Breakdowns ({tasks.length})
          </h4>
          <button 
            onClick={() => navigate(`/water/maintenance/${maint.id}/tasks`)}
            className="water-btn"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}
          >
            Manage Tasks
          </button>
        </div>
        <TaskTable 
          tasks={tasks}
          workers={workers}
          onUpdateStatus={handleUpdateTaskStatus}
        />
      </div>

      {/* Materials logs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: 0, letterSpacing: '0.5px' }}>
            Logistics & Materials Used
          </h4>
          <button 
            onClick={() => setIsMaterialFormOpen(true)}
            className="water-btn"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}
          >
            Record Material
          </button>
        </div>
        <MaterialTable 
          materials={materials}
        />
      </div>

      {/* Visual Photos and Upload form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <PhotoGallery photos={photos} />
        <PhotoUpload onUpload={handlePhotoUpload} />
      </div>

      {/* Material Modal */}
      <MaterialForm 
        isOpen={isMaterialFormOpen}
        onClose={() => setIsMaterialFormOpen(false)}
        onSubmit={handleAddMaterial}
      />

    </div>
  );
}
