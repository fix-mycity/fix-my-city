import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import WorkerPhotoUpload from './WorkerPhotoUpload';

export default function WorkerForm({ initialData, onSubmit, onCancel, isEdit = false }) {
  const [formData, setFormData] = useState({
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
    place: initialData?.place || '',
    pin_code: initialData?.pin_code || '',
    designation: initialData?.designation || '',
    skill: initialData?.skill || 'Leak Repair',
    experience: initialData?.experience || 0,
    joining_date: initialData?.joining_date ? new Date(initialData.joining_date).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
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
  const genders = ['Male', 'Female', 'Other'];
  const availabilities = ['AVAILABLE', 'BUSY', 'ON_LEAVE', 'OFFLINE'];
  const statuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'RETIRED'];

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Only allow letters, spaces, hyphens, and apostrophes in name fields
    if (name === 'first_name' || name === 'last_name') {
      if (!/^[a-zA-Z\s\-']*$/.test(value)) {
        return;
      }
    }

    // Only allow digits and an optional leading plus sign in phone number
    if (name === 'phone') {
      if (!/^\+?[0-9]*$/.test(value)) {
        return;
      }
    }

    // Only allow digits in pin code
    if (name === 'pin_code') {
      if (!/^[0-9]*$/.test(value)) {
        return;
      }
    }

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
    if (!formData.first_name) {
      newErrors.first_name = 'First name is required';
    } else if (/\d/.test(formData.first_name)) {
      newErrors.first_name = 'First name must contain only words and cannot contain numbers';
    } else if (!/^[a-zA-Z\s\-']+$/.test(formData.first_name)) {
      newErrors.first_name = 'First name must contain only letters';
    }

    if (!formData.last_name) {
      newErrors.last_name = 'Last name is required';
    } else if (/\d/.test(formData.last_name)) {
      newErrors.last_name = 'Last name must contain only words and cannot contain numbers';
    } else if (!/^[a-zA-Z\s\-']+$/.test(formData.last_name)) {
      newErrors.last_name = 'Last name must contain only letters';
    }

    if (!formData.email) newErrors.email = 'Email is required';
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (/[a-zA-Z]/.test(formData.phone)) {
      newErrors.phone = 'Phone number must contain only numbers and cannot contain letters or words';
    } else if (!/^\+?[0-9\s\-]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be a valid numeric sequence';
    }

    if (!formData.place) newErrors.place = 'Place is required';

    if (!formData.pin_code) {
      newErrors.pin_code = 'Pin code is required';
    } else if (/[a-zA-Z]/.test(formData.pin_code)) {
      newErrors.pin_code = 'Pin code must contain only numbers and cannot contain letters or words';
    } else if (!/^[0-9]+$/.test(formData.pin_code)) {
      newErrors.pin_code = 'Pin code must contain only digits';
    }
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the validation errors in the form.");
      return;
    }

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

    try {
      await onSubmit(payload);
    } catch (err) {
      const serverErrors = {};
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        detail.forEach(error => {
          const field = error.loc[error.loc.length - 1];
          serverErrors[field] = error.msg;
        });
        setErrors(serverErrors);
        toast.error("Validation failed. Please check the fields below.");
      } else if (typeof detail === 'string') {
        if (detail.toLowerCase().includes("email")) {
          setErrors({ email: detail });
        } else if (detail.toLowerCase().includes("phone")) {
          setErrors({ phone: detail });
        } else if (detail.toLowerCase().includes("pin")) {
          setErrors({ pin_code: detail });
        }
        toast.error(detail);
      } else {
        toast.error("Failed to register field worker. Please verify details.");
      }
    }
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
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Place *</label>
          <input
            type="text"
            name="place"
            value={formData.place}
            onChange={handleChange}
            required
            placeholder="e.g. Green Park"
            style={{
              padding: '0.6rem',
              borderRadius: '6px',
              border: errors.place ? '1px solid var(--water-danger)' : '1px solid var(--water-border)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          {errors.place && <span style={{ fontSize: '0.75rem', color: 'var(--water-danger)' }}>{errors.place}</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>Pin Code *</label>
          <input
            type="text"
            name="pin_code"
            value={formData.pin_code}
            onChange={handleChange}
            required
            placeholder="e.g. 110016"
            style={{
              padding: '0.6rem',
              borderRadius: '6px',
              border: errors.pin_code ? '1px solid var(--water-danger)' : '1px solid var(--water-border)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          {errors.pin_code && <span style={{ fontSize: '0.75rem', color: 'var(--water-danger)' }}>{errors.pin_code}</span>}
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
