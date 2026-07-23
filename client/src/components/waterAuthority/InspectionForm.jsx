import React, { useState } from 'react';

const STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function InspectionForm({ isOpen, onClose, onSubmit, initialData = {} }) {
  if (!isOpen) return null;

  const isEdit = !!initialData.id;

  const [formData, setFormData] = useState({
    inspection_number: initialData.inspection_number || '',
    zone: initialData.zone || '',
    ward: initialData.ward || '',
    area: initialData.area || '',
    sample_location: initialData.sample_location || '',
    inspection_date: initialData.inspection_date || new Date().toISOString().substring(0, 10),
    assigned_inspector: initialData.assigned_inspector || '',
    status: initialData.status || 'SCHEDULED',
    remarks: initialData.remarks || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!formData.ward.trim() || !formData.area.trim()) {
      alert("Ward and Area are required.");
      return;
    }

    const payload = { ...formData };
    if (!payload.inspection_number.trim()) {
      delete payload.inspection_number; // auto-generated if empty
    }

    onSubmit(payload);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <form onSubmit={handleFormSubmit} className="water-card" style={{
        width: '100%',
        maxWidth: '460px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        animation: 'fadeIn 0.2s ease-out',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--water-primary)', margin: 0 }}>
            {isEdit ? `Edit Schedule: ${initialData.inspection_number}` : 'Schedule Quality Inspection'}
          </h3>
          <button 
            type="button" 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--water-text-muted)', display: 'flex', padding: 0 }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div>
          <label className="water-label">Inspection Number (Optional)</label>
          <input 
            type="text" 
            name="inspection_number"
            value={formData.inspection_number}
            onChange={handleChange}
            placeholder="e.g. QIS-100234"
            disabled={isEdit}
            className="water-input"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="water-label">Zone</label>
            <input 
              type="text" 
              name="zone"
              value={formData.zone}
              onChange={handleChange}
              placeholder="e.g. Zone A"
              className="water-input"
            />
          </div>
          <div>
            <label className="water-label">Ward *</label>
            <input 
              type="text" 
              name="ward"
              value={formData.ward}
              onChange={handleChange}
              placeholder="e.g. Ward 2"
              required
              className="water-input"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="water-label">Area *</label>
            <input 
              type="text" 
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="e.g. South End"
              required
              className="water-input"
            />
          </div>
          <div>
            <label className="water-label">Inspection Date *</label>
            <input 
              type="date" 
              name="inspection_date"
              value={formData.inspection_date}
              onChange={handleChange}
              required
              className="water-input"
            />
          </div>
        </div>

        <div>
          <label className="water-label">Sample point / Location description</label>
          <input 
            type="text" 
            name="sample_location"
            value={formData.sample_location}
            onChange={handleChange}
            placeholder="e.g. Main Reservoir output valve"
            className="water-input"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="water-label">Inspector Name</label>
            <input 
              type="text" 
              name="assigned_inspector"
              value={formData.assigned_inspector}
              onChange={handleChange}
              placeholder="e.g. Inspector Davis"
              className="water-input"
            />
          </div>
          <div>
            <label className="water-label">Status</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
              className="water-input"
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="water-label">Remarks</label>
          <input 
            type="text" 
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Special requirements..."
            className="water-input"
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button 
            type="button" 
            onClick={onClose}
            className="water-btn"
            style={{ borderColor: 'var(--water-border)', color: 'var(--water-text)' }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="water-btn"
            style={{ backgroundColor: 'var(--water-primary)', color: '#ffffff', border: 'none', fontWeight: '700' }}
          >
            Save Schedule
          </button>
        </div>
      </form>
    </div>
  );
}
