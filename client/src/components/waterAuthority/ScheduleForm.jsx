import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const SUPPLY_TYPES = [
  { value: 'REGULAR', label: 'Regular Daily Supply' },
  { value: 'SPECIAL', label: 'Special Supply Event' },
  { value: 'EMERGENCY', label: 'Emergency Rationing Supply' }
];

const STATUSES = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'ACTIVE', label: 'Active (Water Currently Flowing)' },
  { value: 'PAUSED', label: 'Paused / Interrupted' },
  { value: 'COMPLETED', label: 'Completed' }
];

const MUNICIPAL_WARDS = [
  'Ward 1 - Central Market',
  'Ward 2 - North Sector',
  'Ward 3 - South Hill',
  'Ward 4 - East Riverside',
  'Ward 5 - Industrial Park',
  'Ward 6 - West Suburb',
  'Ward 12 - Green Hills'
];

export default function ScheduleForm({ initialData = {}, onSubmit, onCancel, isEdit = false }) {
  const [formData, setFormData] = useState({
    schedule_number: initialData?.schedule_number || '',
    zone: initialData?.zone || 'Zone 1 - Central',
    ward: initialData?.ward || 'Ward 1 - Central Market',
    area: initialData?.area || '',
    street: initialData?.street || '',
    supply_type: initialData?.supply_type || 'REGULAR',
    supply_date: initialData?.supply_date || new Date().toISOString().split('T')[0],
    morning_start_time: initialData?.morning_start_time || '06:00',
    morning_end_time: initialData?.morning_end_time || '09:00',
    evening_start_time: initialData?.evening_start_time || '',
    evening_end_time: initialData?.evening_end_time || '',
    water_source: initialData?.water_source || '',
    tank_name: initialData?.tank_name || '',
    pipeline_name: initialData?.pipeline_name || '',
    remarks: initialData?.remarks || '',
    status: initialData?.status || 'SCHEDULED'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ward.trim()) newErrors.ward = 'Ward is required';
    if (!formData.area.trim()) newErrors.area = 'Area is required';
    if (!formData.supply_date) newErrors.supply_date = 'Supply date is required';

    const hasMorning = formData.morning_start_time || formData.morning_end_time;
    const hasEvening = formData.evening_start_time || formData.evening_end_time;

    if (hasMorning && (!formData.morning_start_time || !formData.morning_end_time)) {
      newErrors.morning_start_time = 'Both morning start and end times are required.';
    }

    if (hasEvening && (!formData.evening_start_time || !formData.evening_end_time)) {
      newErrors.evening_start_time = 'Both evening start and end times are required.';
    }

    if (!hasMorning && !hasEvening) {
      newErrors.morning_start_time = 'Please specify at least one time slot (morning or evening).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please resolve validation errors before submitting.');
      return;
    }

    const payload = { ...formData };
    if (!payload.morning_start_time) {
      payload.morning_start_time = null;
      payload.morning_end_time = null;
    }
    if (!payload.evening_start_time) {
      payload.evening_start_time = null;
      payload.evening_end_time = null;
    }
    if (!payload.schedule_number.trim()) {
      delete payload.schedule_number;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="water-form-container" style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
          {isEdit ? `Modify Supply Schedule (${initialData?.schedule_number})` : 'Schedule Water Supply'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.3rem 0 0 0' }}>
          Define municipal water distribution timetables and time slots for targeted wards.
        </p>
      </div>

      {/* 1. Location & Classification */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#2563eb', margin: 0 }}>
          1. Location & Classification
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label className="water-label">Municipal Ward *</label>
            <input 
              type="text" 
              name="ward"
              list="form-ward-list"
              value={formData.ward}
              onChange={handleChange}
              placeholder="e.g. Ward 12 - Green Hills"
              required
              className="water-input"
            />
            <datalist id="form-ward-list">
              {MUNICIPAL_WARDS.map(w => <option key={w} value={w} />)}
            </datalist>
            {errors.ward && <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>{errors.ward}</span>}
          </div>

          <div>
            <label className="water-label">Area / Locality *</label>
            <input 
              type="text" 
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="e.g. Green Hills Colony"
              required
              className="water-input"
            />
            {errors.area && <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>{errors.area}</span>}
          </div>

          <div>
            <label className="water-label">Supply Type</label>
            <select 
              name="supply_type" 
              value={formData.supply_type} 
              onChange={handleChange}
              className="water-select"
            >
              {SUPPLY_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="water-label">Supply Date *</label>
            <input 
              type="date" 
              name="supply_date"
              value={formData.supply_date}
              onChange={handleChange}
              required
              className="water-input"
            />
          </div>
        </div>
      </div>

      {/* 2. Time Slots */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#2563eb', margin: 0 }}>
          2. Distribution Time Slots
        </h4>

        {/* Morning Slot */}
        <div>
          <label className="water-label" style={{ color: '#2563eb' }}>Morning Supply Slot</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#64748b' }}>Start Time</label>
              <input 
                type="time" 
                name="morning_start_time"
                value={formData.morning_start_time}
                onChange={handleChange}
                className="water-input"
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#64748b' }}>End Time</label>
              <input 
                type="time" 
                name="morning_end_time"
                value={formData.morning_end_time}
                onChange={handleChange}
                className="water-input"
              />
            </div>
          </div>
          {errors.morning_start_time && <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>{errors.morning_start_time}</span>}
        </div>

        {/* Evening Slot */}
        <div>
          <label className="water-label" style={{ color: '#ea580c' }}>Evening Supply Slot (Optional)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#64748b' }}>Start Time</label>
              <input 
                type="time" 
                name="evening_start_time"
                value={formData.evening_start_time}
                onChange={handleChange}
                className="water-input"
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#64748b' }}>End Time</label>
              <input 
                type="time" 
                name="evening_end_time"
                value={formData.evening_end_time}
                onChange={handleChange}
                className="water-input"
              />
            </div>
          </div>
          {errors.evening_start_time && <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>{errors.evening_start_time}</span>}
        </div>
      </div>

      {/* 3. Status & Remarks */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#2563eb', margin: 0 }}>
          3. Status & Infrastructure Link
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label className="water-label">Status</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
              className="water-select"
            >
              {STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="water-label">Primary Water Source</label>
            <input 
              type="text" 
              name="water_source"
              value={formData.water_source}
              onChange={handleChange}
              placeholder="e.g. Reservoir B"
              className="water-input"
            />
          </div>
        </div>

        <div>
          <label className="water-label">Remarks & Special Instructions</label>
          <textarea 
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Optional additional notes for field operators or citizens..."
            rows="2"
            className="water-input"
            style={{ resize: 'vertical' }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        justifyContent: 'flex-end',
        marginTop: '1.5rem',
        borderTop: '1px solid #e2e8f0',
        paddingTop: '1.25rem'
      }}>
        <button 
          type="button" 
          onClick={onCancel}
          style={{
            padding: '0.55rem 1.25rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#475569',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>

        <button 
          type="submit" 
          style={{
            padding: '0.55rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          {isEdit ? 'Save Changes' : 'Schedule Water Supply'}
        </button>
      </div>
    </form>
  );
}
