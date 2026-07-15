import React, { useState } from 'react';
import WorkerPhotoUpload from './WorkerPhotoUpload';

export default function WorkerForm({ initialData, onSubmit, onCancel, isEdit = false }) {
  const [formData, setFormData] = useState({
    employee_id: initialData?.employee_id || '',
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    password: '',
    confirmPassword: '',
    photo: initialData?.photo || '',
    gender: initialData?.gender || 'Male',
    date_of_birth: initialData?.date_of_birth ? new Date(initialData.date_of_birth).toISOString().substring(0, 10) : '',
    address: initialData?.address || '',
    ward: initialData?.ward || 'Ward 1',
    area: initialData?.area || 'Green Park',
    designation: initialData?.designation || '',
    skill: initialData?.skill || 'Leak Repair',
    experience: initialData?.experience || 0,
    joining_date: initialData?.joining_date ? new Date(initialData.joining_date).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
    emergency_contact_name: initialData?.emergency_contact_name || '',
    emergency_contact_phone: initialData?.emergency_contact_phone || '',
    availability: initialData?.availability || 'AVAILABLE',
    employment_status: initialData?.employment_status || 'ACTIVE'
  });

  const [errors, setErrors] = useState({});

  const skills = [
    'Leak Repair', 
    'Pipeline Repair', 
    'Valve Operation', 
    'Water Tank Maintenance', 
    'Quality Testing', 
    'General Maintenance'
  ];
  const wards = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6'];
  const areas = ['Green Park', 'Sector 4', 'Zone B', 'Central Expressway', 'Link Road', 'Sector 12'];
  const genders = ['Male', 'Female', 'Other'];
  const availabilities = ['AVAILABLE', 'BUSY', 'ON_LEAVE', 'OFFLINE'];
  const statuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'RETIRED'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience' ? parseInt(value) || 0 : value
    }));
  };

  const handlePhotoChange = (base64Photo) => {
    setFormData(prev => ({ ...prev, photo: base64Photo }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.employee_id) newErrors.employee_id = 'Employee ID is required';
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    
    if (!isEdit) {
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = { ...formData };
    if (!payload.password) {
      delete payload.password;
    }
    delete payload.confirmPassword;

    if (payload.date_of_birth) {
      payload.date_of_birth = new Date(payload.date_of_birth).toISOString();
    } else {
      payload.date_of_birth = null;
    }
    if (payload.joining_date) {
      payload.joining_date = new Date(payload.joining_date).toISOString();
    } else {
      payload.joining_date = null;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} style={{
      backgroundColor: '#ffffff',
      border: '1px solid var(--water-border)',
      borderRadius: 'var(--water-radius)',
      padding: '2rem',
      boxShadow: 'var(--water-shadow)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '700', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.75rem', marginBottom: '0.5rem', color: 'var(--water-primary-dark)' }}>
        {isEdit ? 'Edit Field Worker Details' : 'Register New Field Worker'}
      </h3>

      <WorkerPhotoUpload currentPhoto={formData.photo} onChange={handlePhotoChange} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Employee ID *</label>
          <input
            type="text"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleChange}
            disabled={isEdit}
            required
            style={{
              padding: '0.6rem',
              borderRadius: '6px',
              border: errors.employee_id ? '1px solid var(--water-danger)' : '1px solid var(--water-border)',
              fontSize: '0.85rem',
              backgroundColor: isEdit ? '#f1f5f9' : '#ffffff',
              outline: 'none'
            }}
          />
          {errors.employee_id && <span style={{ fontSize: '0.75rem', color: 'var(--water-danger)' }}>{errors.employee_id}</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Designation</label>
          <input
            type="text"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            placeholder="e.g. Senior Valve Inspector"
            style={{
              padding: '0.6rem',
              borderRadius: '6px',
              border: '1px solid var(--water-border)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>First Name *</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            style={{
              padding: '0.6rem',
              borderRadius: '6px',
              border: errors.first_name ? '1px solid var(--water-danger)' : '1px solid var(--water-border)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          {errors.first_name && <span style={{ fontSize: '0.75rem', color: 'var(--water-danger)' }}>{errors.first_name}</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Last Name *</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            style={{
              padding: '0.6rem',
              borderRadius: '6px',
              border: errors.last_name ? '1px solid var(--water-danger)' : '1px solid var(--water-border)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          {errors.last_name && <span style={{ fontSize: '0.75rem', color: 'var(--water-danger)' }}>{errors.last_name}</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              padding: '0.6rem',
              borderRadius: '6px',
              border: errors.email ? '1px solid var(--water-danger)' : '1px solid var(--water-border)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          {errors.email && <span style={{ fontSize: '0.75rem', color: 'var(--water-danger)' }}>{errors.email}</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Phone Number *</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            style={{
              padding: '0.6rem',
              borderRadius: '6px',
              border: errors.phone ? '1px solid var(--water-danger)' : '1px solid var(--water-border)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          {errors.phone && <span style={{ fontSize: '0.75rem', color: 'var(--water-danger)' }}>{errors.phone}</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>
            Password {isEdit ? '(Leave blank to keep current)' : '*'}
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!isEdit}
            style={{
              padding: '0.6rem',
              borderRadius: '6px',
              border: errors.password ? '1px solid var(--water-danger)' : '1px solid var(--water-border)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          {errors.password && <span style={{ fontSize: '0.75rem', color: 'var(--water-danger)' }}>{errors.password}</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Confirm Password *</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required={!isEdit ? true : !!formData.password}
            style={{
              padding: '0.6rem',
              borderRadius: '6px',
              border: errors.confirmPassword ? '1px solid var(--water-danger)' : '1px solid var(--water-border)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          {errors.confirmPassword && <span style={{ fontSize: '0.75rem', color: 'var(--water-danger)' }}>{errors.confirmPassword}</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.85rem', outline: 'none' }}
          >
            {genders.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Date of Birth</label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            style={{
              padding: '0.6rem',
              borderRadius: '6px',
              border: '1px solid var(--water-border)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Ward Allocation</label>
          <select
            name="ward"
            value={formData.ward}
            onChange={handleChange}
            style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.85rem', outline: 'none' }}
          >
            {wards.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Area Allocation</label>
          <select
            name="area"
            value={formData.area}
            onChange={handleChange}
            style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.85rem', outline: 'none' }}
          >
            {areas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Skill / Specialty</label>
          <select
            name="skill"
            value={formData.skill}
            onChange={handleChange}
            style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.85rem', outline: 'none' }}
          >
            {skills.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Experience (Years)</label>
          <input
            type="number"
            name="experience"
            min="0"
            value={formData.experience}
            onChange={handleChange}
            style={{
              padding: '0.6rem',
              borderRadius: '6px',
              border: '1px solid var(--water-border)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Joining Date</label>
          <input
            type="date"
            name="joining_date"
            value={formData.joining_date}
            onChange={handleChange}
            style={{
              padding: '0.6rem',
              borderRadius: '6px',
              border: '1px solid var(--water-border)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>

        {isEdit && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Availability Status</label>
            <select
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.85rem', outline: 'none' }}
            >
              {availabilities.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        )}

        {isEdit && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Employment Status</label>
            <select
              name="employment_status"
              value={formData.employment_status}
              onChange={handleChange}
              style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--water-border)', fontSize: '0.85rem', outline: 'none' }}
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Emergency Contact Name</label>
          <input
            type="text"
            name="emergency_contact_name"
            value={formData.emergency_contact_name}
            onChange={handleChange}
            placeholder="Next of kin name"
            style={{
              padding: '0.6rem',
              borderRadius: '6px',
              border: '1px solid var(--water-border)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Emergency Contact Phone</label>
          <input
            type="text"
            name="emergency_contact_phone"
            value={formData.emergency_contact_phone}
            onChange={handleChange}
            placeholder="Next of kin phone"
            style={{
              padding: '0.6rem',
              borderRadius: '6px',
              border: '1px solid var(--water-border)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Residential Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          style={{
            padding: '0.6rem',
            borderRadius: '6px',
            border: '1px solid var(--water-border)',
            fontSize: '0.85rem',
            outline: 'none',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={onCancel}
          className="water-btn"
          style={{ padding: '0.6rem 1.5rem', fontWeight: '600' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="water-btn water-btn-primary"
          style={{ padding: '0.6rem 1.5rem', fontWeight: '700' }}
        >
          {isEdit ? 'Save Changes' : 'Register Worker'}
        </button>
      </div>
    </form>
  );
}
