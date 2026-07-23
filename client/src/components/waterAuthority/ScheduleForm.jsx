import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function ScheduleForm({ initialData, onSubmit, onCancel, isEdit = false }) {
  const [formData, setFormData] = useState({
    schedule_number: initialData?.schedule_number || '',
    zone: initialData?.zone || 'Zone A',
    ward: initialData?.ward || 'Ward 1',
    area: initialData?.area || '',
    street: initialData?.street || '',
    supply_type: initialData?.supply_type || 'REGULAR',
    supply_date: initialData?.supply_date || '',
    morning_start_time: initialData?.morning_start_time || '',
    morning_end_time: initialData?.morning_end_time || '',
    evening_start_time: initialData?.evening_start_time || '',
    evening_end_time: initialData?.evening_end_time || '',
    water_source: initialData?.water_source || '',
    tank_name: initialData?.tank_name || '',
    pipeline_name: initialData?.pipeline_name || '',
    remarks: initialData?.remarks || '',
    status: initialData?.status || 'SCHEDULED'
  });

  const [errors, setErrors] = useState({});

  const supplyTypes = ['REGULAR', 'SPECIAL', 'EMERGENCY'];
  const statuses = ['SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'];
  const Wards = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6'];
  const Zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ward) newErrors.ward = 'Ward is required';
    if (!formData.area) newErrors.area = 'Area is required';
    if (!formData.supply_type) newErrors.supply_type = 'Supply type is required';
    if (!formData.supply_date) newErrors.supply_date = 'Supply date is required';

    // Validate times
    const hasMorning = formData.morning_start_time || formData.morning_end_time;
    const hasEvening = formData.evening_start_time || formData.evening_end_time;

    if (hasMorning) {
      if (!formData.morning_start_time || !formData.morning_end_time) {
        newErrors.morning_start_time = 'Both morning start and end times are required if morning supply is scheduled.';
      } else if (formData.morning_start_time >= formData.morning_end_time) {
        newErrors.morning_start_time = 'Morning start time must be before end time.';
      }
    }

    if (hasEvening) {
      if (!formData.evening_start_time || !formData.evening_end_time) {
        newErrors.evening_start_time = 'Both evening start and end times are required if evening supply is scheduled.';
      } else if (formData.evening_start_time >= formData.evening_end_time) {
        newErrors.evening_start_time = 'Evening start time must be before end time.';
      }
    }

    if (!hasMorning && !hasEvening) {
      newErrors.morning_start_time = 'You must specify at least one supply slot (morning or evening) with valid times.';
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
    
    // Clean payload: empty times should be null
    const payload = { ...formData };
    if (!payload.morning_start_time) {
      payload.morning_start_time = null;
      payload.morning_end_time = null;
    }
    if (!payload.evening_start_time) {
      payload.evening_start_time = null;
      payload.evening_end_time = null;
    }
    if (!payload.schedule_number) {
      delete payload.schedule_number;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} style={{
      backgroundColor: '#ffffff',
      border: '1px solid var(--water-border)',
      borderRadius: 'var(--water-radius)',
      padding: '2rem',
      boxShadow: 'var(--water-shadow-md)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.75rem', margin: 0 }}>
        {isEdit ? 'Modify Water Supply Schedule' : 'Create New Water Supply Schedule'}
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Schedule Number (Only edit when creating optionally, or auto) */}
        {!isEdit && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Schedule Number (Optional)</label>
            <input 
              type="text" 
              name="schedule_number"
              value={formData.schedule_number}
              onChange={handleChange}
              placeholder="Auto-generated if empty"
              style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>
        )}

        {/* Zone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Zone</label>
          <select 
            name="zone"
            value={formData.zone}
            onChange={handleChange}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.85rem', outline: 'none' }}
          >
            {Zones.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>

        {/* Ward */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Ward *</label>
          <select 
            name="ward"
            value={formData.ward}
            onChange={handleChange}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.85rem', outline: 'none' }}
          >
            {Wards.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>

        {/* Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Area *</label>
          <input 
            type="text" 
            name="area"
            value={formData.area}
            onChange={handleChange}
            placeholder="e.g. Sector 4, Green Park"
            style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.85rem', outline: 'none' }}
            required
          />
          {errors.area && <span style={{ color: 'var(--water-danger)', fontSize: '0.72rem' }}>{errors.area}</span>}
        </div>

        {/* Street */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Street</label>
          <input 
            type="text" 
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="e.g. Main Avenue, Lane 3"
            style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.85rem', outline: 'none' }}
          />
        </div>

        {/* Supply Type */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Supply Type *</label>
          <select 
            name="supply_type"
            value={formData.supply_type}
            onChange={handleChange}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.85rem', outline: 'none' }}
          >
            {supplyTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Supply Date */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Supply Date *</label>
          <input 
            type="date" 
            name="supply_date"
            value={formData.supply_date}
            onChange={handleChange}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.85rem', outline: 'none' }}
            required
          />
        </div>

        {/* Status (Only edit when editing) */}
        {isEdit && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Status *</label>
            <select 
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.85rem', outline: 'none' }}
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--water-border)', paddingTop: '1.25rem' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--water-text)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: 'var(--water-primary-light)' }}>schedule</span>
          Water Supply Timings
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}>
          {/* Morning Start */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text-muted)' }}>Morning Start Time</label>
            <input 
              type="time" 
              name="morning_start_time"
              value={formData.morning_start_time}
              onChange={handleChange}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          {/* Morning End */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text-muted)' }}>Morning End Time</label>
            <input 
              type="time" 
              name="morning_end_time"
              value={formData.morning_end_time}
              onChange={handleChange}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          {/* Evening Start */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text-muted)' }}>Evening Start Time</label>
            <input 
              type="time" 
              name="evening_start_time"
              value={formData.evening_start_time}
              onChange={handleChange}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          {/* Evening End */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text-muted)' }}>Evening End Time</label>
            <input 
              type="time" 
              name="evening_end_time"
              value={formData.evening_end_time}
              onChange={handleChange}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>
        </div>
        {(errors.morning_start_time || errors.evening_start_time) && (
          <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--water-danger-subtle)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--water-danger)', margin: 0, fontWeight: '600' }}>
              {errors.morning_start_time || errors.evening_start_time}
            </p>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--water-border)', paddingTop: '1.25rem' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--water-text)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: 'var(--water-primary-light)' }}>propane_tank</span>
          Infrastructure & Source Details
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}>
          {/* Water Source */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Water Source</label>
            <input 
              type="text" 
              name="water_source"
              value={formData.water_source}
              onChange={handleChange}
              placeholder="e.g. Reservoir Delta, Ganga River"
              style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          {/* Tank Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Tank Name</label>
            <input 
              type="text" 
              name="tank_name"
              value={formData.tank_name}
              onChange={handleChange}
              placeholder="e.g. Overhead Tank B"
              style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          {/* Pipeline Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Pipeline Name</label>
            <input 
              type="text" 
              name="pipeline_name"
              value={formData.pipeline_name}
              onChange={handleChange}
              placeholder="e.g. Trunk Line 4"
              style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* Remarks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Remarks / Instructions</label>
        <textarea 
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          placeholder="Additional notes about water pressure, special instructions for pipeline operators..."
          style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.85rem', outline: 'none', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--water-border)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
        <button 
          type="button" 
          onClick={onCancel}
          className="water-btn"
          style={{ padding: '0.6rem 1.5rem', fontSize: '0.88rem' }}
        >
          Cancel
        </button>
        <button 
          type="submit"
          className="water-btn water-btn-primary"
          style={{ padding: '0.6rem 1.5rem', fontSize: '0.88rem', fontWeight: '700' }}
        >
          {isEdit ? 'Save Changes' : 'Create Schedule'}
        </button>
      </div>
    </form>
  );
}
