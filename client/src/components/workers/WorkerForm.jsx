import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getWorkerById, createWorker, updateWorker, uploadWorkerPhoto } from '../../services/workerService';

export default function WorkerForm({ department }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const isEmergency = department === 'emergency';

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    state: '',
    district: '',
    pincode: '',
    first_name: '',
    last_name: '',
    phone: '',
    photo: '',
    gender: 'Male',
    designation: '',
    skill: '',
    experience: 0,
    place: '',
    emergency_contact_phone: '',
    availability: 'AVAILABLE',
    employment_status: 'ACTIVE'
  });

  useEffect(() => {
    if (isEditMode) {
      fetchWorkerData();
    }
  }, [id, department]);

  const fetchWorkerData = async () => {
    try {
      const response = await getWorkerById(id, department);
      const data = response.data;

      setFormData(prev => ({
        ...prev,
        ...data,
        password: '',
        confirm_password: ''
      }));
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not load worker data.");
      navigate(`/${department}/workers`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadWorkerPhoto(file);
      const photoUrl = res.data.photo_url || res.data.file_url;
      if (photoUrl) {
        setFormData(prev => ({ ...prev, photo: photoUrl }));
        toast.success("Photo uploaded successfully!");
      }
    } catch (err) {
      toast.error("Failed to upload photo.");
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.first_name.trim()) errors.first_name = "First name is required.";
    if (!formData.last_name.trim()) errors.last_name = "Last name is required.";
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      errors.phone = "Enter a valid 10-digit mobile number.";
    }

    if (formData.emergency_contact_phone && !/^\d{10}$/.test(formData.emergency_contact_phone.trim())) {
      errors.emergency_contact_phone = "Enter a valid 10-digit mobile number.";
    }

    if (!isEditMode) {
      if (!formData.username.trim()) errors.username = "Username is required.";
      if (!formData.email.trim()) {
        errors.email = "Email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errors.email = "Enter a valid email address.";
      }

      if (!formData.password) {
        errors.password = "Password is required.";
      } else if (formData.password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
      }

      if (formData.password !== formData.confirm_password) {
        errors.confirm_password = "Passwords do not match.";
      }

      if (!formData.state.trim()) errors.state = "State is required.";
      if (!formData.district.trim()) errors.district = "District is required.";
      if (!formData.pincode.trim()) {
        errors.pincode = "Pincode is required.";
      } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
        errors.pincode = "Enter a valid 6-digit pincode.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      if (isEditMode) {
        await updateWorker(id, formData, department);
        toast.success("Field worker updated successfully!");
      } else {
        const payload = { ...formData, department };
        delete payload.confirm_password;
        await createWorker(payload, department);
        toast.success("Field worker registered successfully!");
      }
      navigate(`/${department}/workers`);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        const lower = detail.toLowerCase();
        if (lower.includes('username')) {
          setFieldErrors(prev => ({ ...prev, username: detail }));
        } else if (lower.includes('email')) {
          setFieldErrors(prev => ({ ...prev, email: detail }));
        } else if (lower.includes('pincode')) {
          setFieldErrors(prev => ({ ...prev, pincode: detail }));
        } else if (lower.includes('password')) {
          setFieldErrors(prev => ({ ...prev, password: detail }));
        } else {
          toast.error(detail);
        }
      } else if (Array.isArray(detail)) {
        const backendErrors = {};
        detail.forEach(errItem => {
          const fieldName = errItem.loc?.[errItem.loc.length - 1];
          if (fieldName) {
            backendErrors[fieldName] = errItem.msg;
          }
        });
        setFieldErrors(backendErrors);
        toast.error("Please resolve invalid fields.");
      } else {
        toast.error(isEditMode ? "Failed to update worker" : "Failed to register worker");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const buttonClasses = {
    water: 'bg-blue-600 hover:bg-blue-700 text-white',
    traffic: 'bg-amber-600 hover:bg-amber-700 text-white',
    emergency: 'bg-rose-600 hover:bg-rose-500 text-white font-extrabold shadow-lg shadow-rose-900/50',
    default: 'bg-slate-700 hover:bg-slate-800 text-white'
  };
  const primaryBtnClass = buttonClasses[department] || buttonClasses.default;

  const getInputClass = (fieldName) => {
    if (isEmergency) {
      return `w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-colors bg-slate-800 text-white placeholder-slate-500 ${
        fieldErrors[fieldName]
          ? 'border-rose-500 focus:ring-rose-500 text-rose-300'
          : 'border-slate-700 focus:ring-rose-500 text-white'
      }`;
    }
    return `w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-colors bg-white ${
      fieldErrors[fieldName]
        ? 'border-rose-500 focus:ring-rose-500 text-rose-900'
        : 'border-slate-300 focus:ring-blue-500 text-slate-800'
    }`;
  };

  const selectClass = isEmergency
    ? 'w-full px-4 py-2 border border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none bg-slate-800 text-white'
    : 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800';

  const labelClass = isEmergency
    ? 'block text-sm font-semibold text-slate-300 mb-1'
    : 'block text-sm font-semibold text-slate-700 mb-1';

  const sectionHeaderClass = isEmergency
    ? 'p-6 md:p-8 border-b border-slate-800 bg-slate-950/60'
    : 'p-6 md:p-8 border-b border-slate-200 bg-slate-50/50';

  const titleClass = isEmergency ? 'text-lg font-bold text-white mb-4 flex items-center gap-2' : 'text-lg font-bold text-slate-800 mb-4 flex items-center gap-2';

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-10 flex justify-center items-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-slate-400">sync</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 font-sans">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(`/${department}/workers`)}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
            isEmergency ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${isEmergency ? 'text-white' : 'text-slate-900'}`}>
            {isEditMode ? 'Edit Worker Profile' : 'Register New Field Worker'}
          </h1>
          <p className={`text-sm mt-1 ${isEmergency ? 'text-slate-400' : 'text-slate-500'}`}>
            {department === 'water' ? 'Water Authority' : department === 'traffic' ? 'Traffic Control' : department === 'emergency' ? 'Emergency Department' : ''} Operations
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={`rounded-2xl overflow-hidden ${
        isEmergency ? 'bg-slate-900 border border-slate-800 shadow-2xl text-slate-100' : 'bg-white border border-slate-200 shadow-sm'
      }`}>
        
        {/* Core Credentials Section */}
        {!isEditMode && (
          <div className={sectionHeaderClass}>
            <h2 className={titleClass}>
              <span className="material-symbols-outlined text-slate-400">shield_person</span>
              Login Credentials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Username *</label>
                <input 
                  name="username" 
                  value={formData.username} 
                  onChange={handleChange} 
                  className={getInputClass('username')} 
                  placeholder="Enter username"
                />
                {fieldErrors.username && (
                  <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.username}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className={getInputClass('email')} 
                  placeholder="e.g. worker@fixmycity.org"
                />
                {fieldErrors.email && (
                  <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.email}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Password *</label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  className={getInputClass('password')} 
                  placeholder="At least 8 characters"
                />
                {fieldErrors.password && (
                  <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.password}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Confirm Password *</label>
                <input 
                  type="password" 
                  name="confirm_password" 
                  value={formData.confirm_password} 
                  onChange={handleChange} 
                  className={getInputClass('confirm_password')} 
                  placeholder="Re-enter password"
                />
                {fieldErrors.confirm_password && (
                  <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.confirm_password}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Personal Details Section */}
        <div className="p-6 md:p-8">
          <h2 className={titleClass}>
            <span className="material-symbols-outlined text-slate-400">person</span>
            Personal Information
          </h2>

          <div className="flex items-center gap-6 mb-6">
            <div className={`w-20 h-20 rounded-full border-2 overflow-hidden flex items-center justify-center relative ${
              isEmergency ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-100'
            }`}>
              {formData.photo ? (
                <img src={formData.photo} alt="Worker" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-3xl text-slate-400">person</span>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined animate-spin">sync</span>
                </div>
              )}
            </div>
            <div>
              <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-colors ${
                isEmergency ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
              }`}>
                <span className="material-symbols-outlined text-base">upload</span>
                {formData.photo ? 'Change Photo' : 'Upload Photo'}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className={labelClass}>First Name *</label>
              <input name="first_name" value={formData.first_name} onChange={handleChange} className={getInputClass('first_name')} placeholder="e.g. Rahul" />
              {fieldErrors.first_name && (
                <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.first_name}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Last Name *</label>
              <input name="last_name" value={formData.last_name} onChange={handleChange} className={getInputClass('last_name')} placeholder="e.g. Sharma" />
              {fieldErrors.last_name && (
                <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.last_name}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Phone Number *</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className={getInputClass('phone')} placeholder="10-digit mobile number" />
              {fieldErrors.phone && (
                <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.phone}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Emergency Contact</label>
              <input name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} className={getInputClass('emergency_contact_phone')} placeholder="10-digit mobile number" />
              {fieldErrors.emergency_contact_phone && (
                <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.emergency_contact_phone}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className={selectClass}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Location Section */}
          <h2 className={titleClass}>
            <span className="material-symbols-outlined text-slate-400">location_on</span>
            Location Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {!isEditMode && (
              <>
                <div>
                  <label className={labelClass}>State *</label>
                  <input name="state" value={formData.state} onChange={handleChange} className={getInputClass('state')} placeholder="e.g. Kerala" />
                  {fieldErrors.state && (
                    <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.state}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>District *</label>
                  <input name="district" value={formData.district} onChange={handleChange} className={getInputClass('district')} placeholder="e.g. Ernakulam" />
                  {fieldErrors.district && (
                    <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.district}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Pincode *</label>
                  <input name="pincode" value={formData.pincode} onChange={handleChange} className={getInputClass('pincode')} placeholder="6-digit pincode" />
                  {fieldErrors.pincode && (
                    <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.pincode}</p>
                  )}
                </div>
              </>
            )}
            <div className="md:col-span-3">
              <label className={labelClass}>Assigned Place / Zone</label>
              <input name="place" value={formData.place} onChange={handleChange} className={getInputClass('place')} placeholder="e.g. City Center Emergency Station" />
            </div>
          </div>

          {/* Employment Details */}
          <h2 className={titleClass}>
            <span className="material-symbols-outlined text-slate-400">work</span>
            Employment & Skill Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className={labelClass}>Designation</label>
              <input name="designation" value={formData.designation} onChange={handleChange} className={getInputClass('designation')} placeholder={isEmergency ? "e.g. Ambulance Driver / Paramedic" : "e.g. Field Officer"} />
            </div>
            <div>
              <label className={labelClass}>Primary Skill</label>
              <input name="skill" value={formData.skill} onChange={handleChange} className={getInputClass('skill')} placeholder={isEmergency ? "e.g. Blood Donor Coordination / Fire Fighting" : "e.g. Technical Ops"} />
            </div>
            <div>
              <label className={labelClass}>Experience (Years)</label>
              <input type="number" min="0" name="experience" value={formData.experience} onChange={handleChange} className={getInputClass('experience')} />
            </div>
            
            {isEditMode && (
              <>
                <div>
                  <label className={labelClass}>Availability</label>
                  <select name="availability" value={formData.availability} onChange={handleChange} className={selectClass}>
                    <option value="AVAILABLE">Available</option>
                    <option value="ON_BREAK">On Break</option>
                    <option value="BUSY">Busy</option>
                    <option value="ON_LEAVE">On Leave</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Employment Status</label>
                  <select name="employment_status" value={formData.employment_status} onChange={handleChange} className={selectClass}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className={`p-6 border-t flex items-center justify-end gap-4 ${
          isEmergency ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <button 
            type="button" 
            onClick={() => navigate(`/${department}/workers`)}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors ${
              isEmergency ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSaving}
            className={`px-6 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-all disabled:opacity-50 ${primaryBtnClass}`}
          >
            {isSaving ? 'Saving...' : isEditMode ? 'Update Worker Profile' : 'Register Worker'}
          </button>
        </div>

      </form>
    </div>
  );
}
