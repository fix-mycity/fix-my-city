import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import MaintenanceHistoryTable from '../../components/waterAuthority/MaintenanceHistoryTable';
import { getTankById } from '../../services/waterTankService';
import { getTankMaintenances, createTankMaintenance, deleteTankMaintenance } from '../../services/tankMaintenanceService';

const MAINT_TYPES = ['CLEANING', 'REPAIR', 'INSPECTION', 'REPLACEMENT'];
const MAINT_STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function TankMaintenanceHistoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tank, setTank] = useState(null);
  const [maintenances, setMaintenances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    maintenance_type: 'CLEANING',
    reason: '',
    start_date: new Date().toISOString().substring(0, 10),
    end_date: '',
    assigned_worker: '',
    status: 'SCHEDULED',
    remarks: ''
  });

  const fetchTankAndMaintenances = async () => {
    setIsLoading(true);
    try {
      const tankResponse = await getTankById(id);
      setTank(tankResponse.data);

      const maintResponse = await getTankMaintenances(id);
      setMaintenances(maintResponse.data);
    } catch (err) {
      toast.error("Could not fetch tank/maintenance details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTankAndMaintenances();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createTankMaintenance(id, {
        maintenance_type: formData.maintenance_type,
        reason: formData.reason || null,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        assigned_worker: formData.assigned_worker || null,
        status: formData.status,
        remarks: formData.remarks || null
      });

      toast.success("Maintenance recorded successfully!");
      setFormData({
        maintenance_type: 'CLEANING',
        reason: '',
        start_date: new Date().toISOString().substring(0, 10),
        end_date: '',
        assigned_worker: '',
        status: 'SCHEDULED',
        remarks: ''
      });
      fetchTankAndMaintenances();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to log maintenance.");
    }
  };

  const handleDeleteMaint = async (maintId) => {
    if (window.confirm("Are you sure you want to delete this maintenance record?")) {
      try {
        await deleteTankMaintenance(maintId);
        toast.success("Maintenance record deleted.");
        fetchTankAndMaintenances();
      } catch (err) {
        toast.error("Failed to delete maintenance record.");
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '2.5rem', color: 'var(--water-primary-light)' }}>
          autorenew
        </span>
      </div>
    );
  }

  if (!tank) {
    return (
      <div className="water-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3>Water tank not found</h3>
        <button onClick={() => navigate('/water/tanks')} className="water-btn" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button 
          onClick={() => navigate(`/water/tanks/${id}`)}
          className="water-btn-icon" 
          title="Back to Details"
          style={{ border: '1px solid var(--water-border)', width: '36px', height: '36px', borderRadius: '8px' }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--water-text)', margin: 0 }}>
            Tank Maintenance Manager: {tank.tank_number}
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)' }}>
            Operational Status: <strong>{tank.status.replace(/_/g, ' ')}</strong>
          </span>
        </div>
      </div>

      {/* Grid: Form and list */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Record Maintenance Form */}
        <form onSubmit={handleSubmit} className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
            Schedule / Log Maintenance Task
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="water-label">Maintenance Type *</label>
              <select 
                name="maintenance_type" 
                value={formData.maintenance_type} 
                onChange={handleChange}
                className="water-input"
              >
                {MAINT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="water-label">Task Status *</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange}
                className="water-input"
              >
                {MAINT_STATUSES.map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="water-label">Reason / Work Details *</label>
            <input 
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="e.g. Scheduled quarterly cleaning, leak repair"
              required
              className="water-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="water-label">Start Date *</label>
              <input 
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="water-input"
              />
            </div>

            <div>
              <label className="water-label">End Date (If completed)</label>
              <input 
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="water-input"
              />
            </div>
          </div>

          <div>
            <label className="water-label">Assigned Worker Name</label>
            <input 
              type="text"
              name="assigned_worker"
              value={formData.assigned_worker}
              onChange={handleChange}
              placeholder="e.g. Robert Smith"
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Remarks</label>
            <input 
              type="text"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="e.g. Inspect valves after cleaning"
              className="water-input"
            />
          </div>

          <button 
            type="submit" 
            className="water-btn"
            style={{ backgroundColor: 'var(--water-primary)', color: '#ffffff', border: 'none', fontWeight: '700', marginTop: '0.5rem' }}
          >
            Schedule & Log Task
          </button>
        </form>

        {/* Maintenance History List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: 0, letterSpacing: '0.5px' }}>
            Registered Maintenance Tracks
          </h4>
          <MaintenanceHistoryTable 
            maintenances={maintenances} 
            onDelete={handleDeleteMaint}
          />
        </div>
      </div>

    </div>
  );
}
