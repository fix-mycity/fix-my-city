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
    <form onSubmit={handleSubmit} className="premium-form-container">
      <div className="premium-form-header">
        <h3>
          <span className="material-symbols-outlined" style={{ fontSize: '1.6rem', color: 'var(--water-primary-light)' }}>
            {isEdit ? 'edit_square' : 'person_add'}
          </span>
          {isEdit ? 'Edit Field Worker Details' : 'Register New Field Worker'}
        </h3>
      </div>

      <WorkerPhotoUpload currentPhoto={formData.photo} onChange={handlePhotoChange} />

      <h4 className="premium-form-section-title">Personal Details</h4>
      <div className="premium-form-grid">
        <div className="premium-field-group">
          <label className="premium-label">First Name *</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            className={`premium-input ${errors.first_name ? 'error' : ''}`}
            placeholder="e.g. Sahil"
          />
          {errors.first_name && <span className="premium-error-text">{errors.first_name}</span>}
        </div>

        <div className="premium-field-group">
          <label className="premium-label">Last Name *</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            className={`premium-input ${errors.last_name ? 'error' : ''}`}
            placeholder="e.g. Jiggle"
          />
          {errors.last_name && <span className="premium-error-text">{errors.last_name}</span>}
        </div>

        <div className="premium-field-group">
          <label className="premium-label">Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={`premium-input ${errors.email ? 'error' : ''}`}
            placeholder="e.g. sahil.jiggle@example.com"
          />
          {errors.email && <span className="premium-error-text">{errors.email}</span>}
        </div>

        <div className="premium-field-group">
          <label className="premium-label">Phone Number *</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className={`premium-input ${errors.phone ? 'error' : ''}`}
            placeholder="e.g. 8139065847"
          />
          {errors.phone && <span className="premium-error-text">{errors.phone}</span>}
        </div>

        <div className="premium-field-group">
          <label className="premium-label">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="premium-select"
          >
            {genders.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="premium-field-group">
          <label className="premium-label">Date of Birth</label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            className="premium-input"
          />
        </div>
      </div>

      <h4 className="premium-form-section-title">Professional Details</h4>
      <div className="premium-form-grid">
        <div className="premium-field-group">
          <label className="premium-label">Designation</label>
          <input
            type="text"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            placeholder="e.g. Senior Valve Inspector"
            className="premium-input"
          />
        </div>

        <div className="premium-field-group">
          <label className="premium-label">Skill / Specialty</label>
          <select
            name="skill"
            value={formData.skill}
            onChange={handleChange}
            className="premium-select"
          >
            {skills.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="premium-field-group">
          <label className="premium-label">Experience (Years)</label>
          <input
            type="number"
            name="experience"
            min="0"
            value={formData.experience}
            onChange={handleChange}
            className="premium-input"
          />
        </div>

        <div className="premium-field-group">
          <label className="premium-label">Joining Date</label>
          <input
            type="date"
            name="joining_date"
            value={formData.joining_date}
            onChange={handleChange}
            className="premium-input"
          />
        </div>

        <div className="premium-field-group">
          <label className="premium-label">Emergency Contact Phone</label>
          <input
            type="text"
            name="emergency_contact_phone"
            value={formData.emergency_contact_phone}
            onChange={handleChange}
            placeholder="e.g. 9876543210"
            className="premium-input"
          />
        </div>

        {isEdit && (
          <div className="premium-field-group">
            <label className="premium-label">Availability Status</label>
            <select
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className="premium-select"
            >
              {availabilities.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        )}

        {isEdit && (
          <div className="premium-field-group">
            <label className="premium-label">Employment Status</label>
            <select
              name="employment_status"
              value={formData.employment_status}
              onChange={handleChange}
              className="premium-select"
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
      </div>

      <h4 className="premium-form-section-title">Residential Details</h4>
      <div className="premium-form-grid">
        <div className="premium-field-group">
          <label className="premium-label">Place *</label>
          <input
            type="text"
            name="place"
            value={formData.place}
            onChange={handleChange}
            required
            placeholder="e.g. Green Park"
            className={`premium-input ${errors.place ? 'error' : ''}`}
          />
          {errors.place && <span className="premium-error-text">{errors.place}</span>}
        </div>

        <div className="premium-field-group">
          <label className="premium-label">Pin Code *</label>
          <input
            type="text"
            name="pin_code"
            value={formData.pin_code}
            onChange={handleChange}
            required
            placeholder="e.g. 110016"
            className={`premium-input ${errors.pin_code ? 'error' : ''}`}
          />
          {errors.pin_code && <span className="premium-error-text">{errors.pin_code}</span>}
        </div>

        <div className="premium-field-group full-width">
          <label className="premium-label">Residential Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            placeholder="Enter full street address"
            className="premium-textarea"
          />
        </div>
      </div>

      <h4 className="premium-form-section-title">Credentials & Security</h4>
      <div className="premium-form-grid">
        <div className="premium-field-group">
          <label className="premium-label">
            Password {isEdit ? '(Leave blank to keep current)' : '*'}
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!isEdit}
            className={`premium-input ${errors.password ? 'error' : ''}`}
            placeholder="••••••••"
          />
          {errors.password && <span className="premium-error-text">{errors.password}</span>}
        </div>

        <div className="premium-field-group">
          <label className="premium-label">Confirm Password *</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required={!isEdit ? true : !!formData.password}
            className={`premium-input ${errors.confirmPassword ? 'error' : ''}`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && <span className="premium-error-text">{errors.confirmPassword}</span>}
        </div>
      </div>

      <div className="premium-btn-row">
        <button
          type="button"
          onClick={onCancel}
          className="water-btn"
          style={{ padding: '0.65rem 1.75rem', fontWeight: '600', borderRadius: '10px' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="water-btn water-btn-primary"
          style={{ padding: '0.65rem 1.75rem', fontWeight: '700', borderRadius: '10px' }}
        >
          {isEdit ? 'Save Changes' : 'Register Worker'}
        </button>
      </div>
    </form>
  );
}
