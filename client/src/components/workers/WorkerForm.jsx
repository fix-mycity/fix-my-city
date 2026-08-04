import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getWorkerById, createWorker, updateWorker, uploadWorkerPhoto } from '../../services/workerService';

export default function WorkerForm({ department }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

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
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      
      try {
        setIsUploading(true);
        const response = await uploadWorkerPhoto(file);
        if (response.data.success) {
          setFormData(prev => ({ ...prev, photo: response.data.url }));
          toast.success('Photo uploaded successfully');
        }
      } catch (error) {
        toast.error('Failed to upload photo to S3');
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const errors = {};

    if (!isEditMode) {
      if (!formData.username || formData.username.trim().length < 3) {
        errors.username = "Username must be at least 3 characters.";
      } else if (formData.username.trim().length > 50) {
        errors.username = "Username must be 50 characters or less.";
      }

      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errors.email = "Please enter a valid email address.";
      }

      if (!formData.password || formData.password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
      }

      if (!formData.confirm_password) {
        errors.confirm_password = "Please confirm your password.";
      } else if (formData.password !== formData.confirm_password) {
        errors.confirm_password = "Passwords do not match.";
      }

      if (!formData.state || !formData.state.trim()) {
        errors.state = "State is required.";
      }

      if (!formData.district || !formData.district.trim()) {
        errors.district = "District is required.";
      }

      if (!formData.pincode || !/^\d{6}$/.test(formData.pincode.trim())) {
        errors.pincode = "Please enter a valid 6-digit pincode.";
      }
    }

    if (formData.phone && formData.phone.trim() && !/^\d{10}$/.test(formData.phone.trim())) {
      errors.phone = "Phone number must be 10 digits.";
    }

    if (formData.emergency_contact_phone && formData.emergency_contact_phone.trim() && !/^\d{10}$/.test(formData.emergency_contact_phone.trim())) {
      errors.emergency_contact_phone = "Emergency contact must be 10 digits.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fix the highlighted field errors.");
      return;
    }

    setIsSaving(true);
    try {
      if (isEditMode) {
        const { username, email, password, confirm_password, state, district, pincode, created_at, joining_date, ...updateData } = formData;
        if (updateData.photo) {
          updateData.photo = updateData.photo.split('?')[0];
        }
        await updateWorker(id, updateData, department);
        toast.success("Worker updated successfully");
      } else {
        const payload = { 
          ...formData,
          joining_date: new Date().toISOString()
        };
        if (payload.photo) {
          payload.photo = payload.photo.split('?')[0];
        }
        const res = await createWorker(payload, department);
        if (res?.data?.success === false) {
          toast.error(res.data.message || "Failed to register worker");
          return;
        }
        toast.success("Worker registered successfully");
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
        toast.error("Please resolve the invalid fields.");
      } else {
        toast.error(isEditMode ? "Failed to update worker" : "Failed to register worker");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const buttonClasses = {
    water: 'bg-blue-600 hover:bg-blue-700',
    traffic: 'bg-amber-600 hover:bg-amber-700',
    default: 'bg-slate-600 hover:bg-slate-700'
  };
  const primaryBtnClass = buttonClasses[department] || buttonClasses.default;

  const getInputClass = (fieldName) => {
    return `w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-colors ${
      fieldErrors[fieldName]
        ? 'border-rose-500 focus:ring-rose-500 bg-rose-50/20 text-rose-900'
        : 'border-slate-300 focus:ring-blue-500 text-slate-800'
    }`;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-10 flex justify-center items-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-slate-400">sync</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(`/${department}/workers`)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isEditMode ? 'Edit Worker Profile' : 'Register New Worker'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {department === 'water' ? 'Water Authority' : department === 'traffic' ? 'Traffic Control' : department === 'general' ? 'General Operations' : ''} Department
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Core Credentials Section */}
        {!isEditMode && (
          <div className="p-6 md:p-8 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400">shield_person</span>
              Login Credentials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username *</label>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password *</label>
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

        {/* Profile Info Section */}
        <div className="p-6 md:p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">badge</span>
            Personal Information
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-sm flex items-center justify-center">
                {isUploading ? (
                  <div className="animate-pulse flex items-center justify-center w-full h-full bg-slate-200">
                    <span className="material-symbols-outlined text-slate-400">sync</span>
                  </div>
                ) : formData.photo ? (
                  <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-slate-300 text-4xl">person</span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors border-2 border-white cursor-pointer disabled:opacity-50">
                <span className="material-symbols-outlined text-[1rem]">photo_camera</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                  disabled={isUploading}
                />
              </label>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Profile Photo</h3>
              <p className="text-xs text-slate-500">Upload a professional photo (Max 2MB).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input name="first_name" value={formData.first_name} onChange={handleChange} className={getInputClass('first_name')} placeholder="e.g. Ramees" />
              {fieldErrors.first_name && (
                <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.first_name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input name="last_name" value={formData.last_name} onChange={handleChange} className={getInputClass('last_name')} placeholder="e.g. Khan" />
              {fieldErrors.last_name && (
                <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.last_name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className={getInputClass('phone')} placeholder="10-digit mobile number" />
              {fieldErrors.phone && (
                <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.phone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact</label>
              <input name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} className={getInputClass('emergency_contact_phone')} placeholder="10-digit mobile number" />
              {fieldErrors.emergency_contact_phone && (
                <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.emergency_contact_phone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">location_on</span>
            Location Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {!isEditMode && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State *</label>
                  <input name="state" value={formData.state} onChange={handleChange} className={getInputClass('state')} placeholder="e.g. Kerala" />
                  {fieldErrors.state && (
                    <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.state}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">District *</label>
                  <input name="district" value={formData.district} onChange={handleChange} className={getInputClass('district')} placeholder="e.g. Malappuram" />
                  {fieldErrors.district && (
                    <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.district}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pincode *</label>
                  <input name="pincode" value={formData.pincode} onChange={handleChange} className={getInputClass('pincode')} placeholder="6-digit pincode" />
                  {fieldErrors.pincode && (
                    <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.pincode}</p>
                  )}
                </div>
              </>
            )}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Place / Zone</label>
              <input name="place" value={formData.place} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Manjeri Junction Zone" />
            </div>
          </div>

          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">work</span>
            Employment Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
              <input name="designation" value={formData.designation} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Traffic Marshal" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Primary Skill</label>
              <input name="skill" value={formData.skill} onChange={handleChange} placeholder="e.g. Signal Maintenance" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Experience (Years)</label>
              <input type="number" min="0" name="experience" value={formData.experience} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            
            {isEditMode && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Availability</label>
                  <select name="availability" value={formData.availability} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="AVAILABLE">Available</option>
                    <option value="BUSY">Busy</option>
                    <option value="ON_LEAVE">On Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Employment Status</label>
                  <select name="employment_status" value={formData.employment_status} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
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
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-4">
          <button 
            type="button" 
            onClick={() => navigate(`/${department}/workers`)}
            className="px-6 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSaving}
            className={`px-6 py-2.5 rounded-lg font-medium text-white ${primaryBtnClass} transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2`}
          >
            {isSaving && <span className="material-symbols-outlined animate-spin text-sm">sync</span>}
            {isSaving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Register Worker')}
          </button>
        </div>
      </form>
    </div>
  );
}
