import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getWorkerById, createWorker, updateWorker, uploadWorkerPhoto } from '../../services/workerService';

export default function WorkerForm({ department }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const isEmergency = department === 'emergency';

  const todayStr = new Date().toISOString().split('T')[0];

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone: '',
    photo: '',
    gender: 'Male',
    state: 'Kerala',
    district: '',
    pincode: '',
    designation: '',
    skill: '',
    experience: 0,
    place: '',
    joining_date: todayStr,
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

      let formattedJoiningDate = todayStr;
      if (data.joining_date) {
        try {
          formattedJoiningDate = new Date(data.joining_date).toISOString().split('T')[0];
        } catch (e) {
          formattedJoiningDate = todayStr;
        }
      }

      setFormData(prev => ({
        ...prev,
        ...data,
        joining_date: formattedJoiningDate,
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
      const photoUrl = res.data.url || res.data.photo_url || res.data.file_url;
      if (photoUrl) {
        setFormData(prev => ({ ...prev, photo: photoUrl }));
        toast.success("Photo uploaded successfully!");
      }
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Failed to upload photo');
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
        const { username, email, password, confirm_password, state, district, pincode, created_at, joining_date, ...updateData } = formData;
        if (updateData.photo) {
          updateData.photo = updateData.photo.split('?')[0];
        }
        await updateWorker(id, updateData, department);
        toast.success("Worker profile updated successfully");
      } else {
        // Auto-generate clean username if missing
        let cleanUsername = formData.username;
        if (!cleanUsername) {
          cleanUsername = formData.email ? formData.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') : '';
          if (cleanUsername.length < 3) {
            const fn = (formData.first_name || 'worker').toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
            const ln = (formData.last_name || 'user').toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
            cleanUsername = `${fn}_${ln}_${Math.floor(100 + Math.random() * 900)}`;
          }
        }

        const payload = { 
          ...formData,
          username: cleanUsername,
          place: formData.place || formData.district || 'Municipal Zone',
          joining_date: formData.joining_date ? new Date(formData.joining_date).toISOString() : new Date().toISOString()
        };
        if (payload.photo) {
          payload.photo = payload.photo.split('?')[0];
        }
        const res = await createWorker(payload, department);
        if (res?.data?.success === false) {
          toast.error(res.data.message || "Failed to register worker");
          return;
        }
        toast.success("Worker registered successfully!");
      }
      navigate(`/${department}/workers`);
    } catch (err) {
      console.error("Registration error:", err);
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
    water: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
    traffic: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 text-white',
    waste: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 text-white',
    emergency: 'bg-rose-600 hover:bg-rose-500 text-white font-extrabold shadow-lg shadow-rose-900/50',
    default: 'bg-slate-700 hover:bg-slate-800 focus:ring-slate-500 text-white'
  };
  const primaryBtnClass = buttonClasses[department] || buttonClasses.default;

  const labelClass = `block text-xs font-semibold uppercase tracking-wide mb-1.5 ${
    isEmergency ? 'text-slate-300' : 'text-slate-700'
  }`;

  const getInputClass = (fieldName) => {
    const base = "w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 outline-none transition-all";
    if (isEmergency) {
      return `${base} bg-slate-800 placeholder-slate-500 border-slate-700 focus:ring-rose-500 text-white`;
    }
    const ringFocus = department === 'waste' ? 'focus:ring-emerald-500 focus:border-emerald-500' : 'focus:ring-blue-500 focus:border-blue-500';
    return `${base} bg-white placeholder-slate-400 ${ringFocus} ${
      fieldErrors[fieldName]
        ? 'border-rose-500 focus:ring-rose-500 text-rose-900'
        : 'border-slate-300 text-slate-800'
    }`;
  };

  const getSelectClass = () => {
    const base = "w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 outline-none transition-all";
    if (isEmergency) {
      return `${base} bg-slate-800 text-white border-slate-700 focus:ring-rose-500`;
    }
    const ringFocus = department === 'waste' ? 'focus:ring-emerald-500' : 'focus:ring-blue-500';
    return `${base} bg-white text-slate-800 border-slate-300 ${ringFocus}`;
  };

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
          type="button"
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
            {department === 'water' ? 'Water Authority' : department === 'traffic' ? 'Traffic Control' : department === 'waste' ? 'Waste Sanitation Management' : department === 'emergency' ? 'Emergency Department' : 'General Operations'} Operations
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={`rounded-2xl border overflow-hidden transition-all ${
        isEmergency 
          ? 'bg-slate-900 border-slate-800 shadow-2xl text-slate-100' 
          : 'bg-white border-slate-200 shadow-sm text-slate-800'
      }`}>
        
        {/* Profile Photo Header */}
        <div className={`p-6 md:p-8 border-b flex flex-col sm:flex-row items-center gap-6 ${
          isEmergency ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <div className="relative shrink-0">
            <div className={`w-24 h-24 rounded-full overflow-hidden border-4 shadow-md flex items-center justify-center ${
              isEmergency ? 'border-slate-800 bg-slate-800' : 'border-white bg-slate-100'
            }`}>
              {isUploading ? (
                <div className={`animate-pulse flex items-center justify-center w-full h-full ${isEmergency ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  <span className="material-symbols-outlined text-slate-400 animate-spin">sync</span>
                </div>
              ) : formData.photo ? (
                <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-slate-400 text-5xl">person</span>
              )}
            </div>
            <label className={`absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors border-2 cursor-pointer disabled:opacity-50 ${
              isEmergency ? 'bg-rose-600 hover:bg-rose-500 text-white border-slate-900' : 'bg-blue-600 hover:bg-blue-700 text-white border-white'
            }`}>
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
          <div className="text-center sm:text-left">
            <h3 className={`text-base font-semibold ${isEmergency ? 'text-white' : 'text-slate-800'}`}>Profile Photo</h3>
            <p className={`text-xs mt-1 ${isEmergency ? 'text-slate-400' : 'text-slate-500'}`}>Upload a professional field officer photo (JPEG, PNG • Max 2MB).</p>
          </div>
        </div>

        {/* Section 1: Personal Details */}
        <div className={`p-6 md:p-8 border-b ${isEmergency ? 'border-slate-800' : 'border-slate-100'}`}>
          <h2 className={`text-md font-bold uppercase tracking-wider mb-5 flex items-center gap-2 ${
            isEmergency ? 'text-rose-500' : 'text-slate-900'
          }`}>
            <span className={`material-symbols-outlined ${isEmergency ? 'text-rose-500' : 'text-blue-600'}`}>badge</span>
            Personal Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>First Name *</label>
              <input 
                required 
                type="text" 
                name="first_name" 
                placeholder="e.g. Abhinav" 
                value={formData.first_name} 
                onChange={handleChange} 
                className={getInputClass('first_name')} 
              />
              {fieldErrors.first_name && (
                <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.first_name}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Last Name *</label>
              <input 
                required 
                type="text" 
                name="last_name" 
                placeholder="e.g. Kumar" 
                value={formData.last_name} 
                onChange={handleChange} 
                className={getInputClass('last_name')} 
              />
              {fieldErrors.last_name && (
                <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.last_name}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Email Address *</label>
              <input 
                required 
                type="email" 
                name="email" 
                disabled={isEditMode}
                placeholder="e.g. officer@fixmycity.gov" 
                value={formData.email} 
                onChange={handleChange} 
                className={`${getInputClass('email')} disabled:opacity-50`} 
              />
              {fieldErrors.email && (
                <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.email}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Phone Number *</label>
              <input 
                required 
                type="tel" 
                name="phone" 
                placeholder="e.g. 9846012345" 
                value={formData.phone} 
                onChange={handleChange} 
                className={getInputClass('phone')} 
              />
              {fieldErrors.phone && (
                <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.phone}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange} 
                className={getSelectClass()}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Emergency Contact Phone</label>
              <input 
                type="tel" 
                name="emergency_contact_phone" 
                placeholder="e.g. 9846998877" 
                value={formData.emergency_contact_phone} 
                onChange={handleChange} 
                className={getInputClass('emergency_contact_phone')} 
              />
              {fieldErrors.emergency_contact_phone && (
                <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.emergency_contact_phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Location Details */}
        <div className={`p-6 md:p-8 border-b ${isEmergency ? 'border-slate-800' : 'border-slate-100'}`}>
          <h2 className={`text-md font-bold uppercase tracking-wider mb-5 flex items-center gap-2 ${
            isEmergency ? 'text-rose-500' : 'text-slate-900'
          }`}>
            <span className={`material-symbols-outlined ${isEmergency ? 'text-rose-500' : 'text-blue-600'}`}>location_on</span>
            Location Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {!isEditMode ? (
              <>
                <div>
                  <label className={labelClass}>State *</label>
                  <input 
                    required 
                    name="state" 
                    placeholder="Kerala" 
                    value={formData.state} 
                    onChange={handleChange} 
                    className={getInputClass('state')} 
                  />
                  {fieldErrors.state && (
                    <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.state}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>District *</label>
                  <input 
                    required 
                    name="district" 
                    placeholder="e.g. Malappuram" 
                    value={formData.district} 
                    onChange={handleChange} 
                    className={getInputClass('district')} 
                  />
                  {fieldErrors.district && (
                    <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.district}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Pincode *</label>
                  <input 
                    required 
                    name="pincode" 
                    placeholder="e.g. 676505" 
                    value={formData.pincode} 
                    onChange={handleChange} 
                    className={getInputClass('pincode')} 
                  />
                  {fieldErrors.pincode && (
                    <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.pincode}</p>
                  )}
                </div>
              </>
            ) : (
              <div className="md:col-span-3">
                <label className={labelClass}>Assigned District / Zone</label>
                <input 
                  name="district" 
                  placeholder="e.g. Malappuram" 
                  value={formData.district} 
                  onChange={handleChange} 
                  className={getInputClass('district')} 
                />
              </div>
            )}
            <div className="md:col-span-3">
              <label className={labelClass}>Assigned Place / Zone</label>
              <input 
                name="place" 
                value={formData.place} 
                onChange={handleChange} 
                className={getInputClass('place')} 
                placeholder="e.g. Manjeri Junction Zone" 
              />
            </div>
          </div>
        </div>

        {/* Section 3: Professional & Employment Details */}
        <div className={`p-6 md:p-8 border-b ${isEmergency ? 'border-slate-800' : 'border-slate-100'}`}>
          <h2 className={`text-md font-bold uppercase tracking-wider mb-5 flex items-center gap-2 ${
            isEmergency ? 'text-rose-500' : 'text-slate-900'
          }`}>
            <span className={`material-symbols-outlined ${isEmergency ? 'text-rose-500' : 'text-blue-600'}`}>work</span>
            Employment & Skill Details
          </h2>
          {department === 'waste' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className={labelClass}>Role / Designation *</label>
                <select 
                  name="role" 
                  value={formData.role || 'Collector'} 
                  onChange={(e) => {
                    handleChange(e);
                    setFormData(prev => ({ ...prev, designation: e.target.value, role: e.target.value }));
                  }} 
                  className={getSelectClass()}
                >
                  <option value="Collector">Collector (Sanitation Cleaner)</option>
                  <option value="Driver">Driver (Truck / Compactor Driver)</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Inspector">Inspector</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Primary Skill</label>
                <input 
                  name="skill" 
                  placeholder="e.g. Waste Collection, Compactor Driving" 
                  value={formData.skill || ''} 
                  onChange={handleChange} 
                  className={getInputClass('skill')} 
                />
              </div>

              <div>
                <label className={labelClass}>Experience (Years)</label>
                <input 
                  type="number" 
                  min="0" 
                  name="experience" 
                  value={formData.experience || 0} 
                  onChange={handleChange} 
                  className={getInputClass('experience')} 
                />
              </div>

              <div>
                <label className={labelClass}>Joining Date</label>
                <input
                  type="date"
                  max={todayStr}
                  name="joining_date"
                  value={formData.joining_date || ''}
                  onChange={handleChange}
                  className={getInputClass('joining_date')}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Designation *</label>
                <input 
                  required 
                  name="designation" 
                  placeholder={isEmergency ? "e.g. Fireman / Emergency Dispatcher" : "e.g. Senior Technician"} 
                  value={formData.designation} 
                  onChange={handleChange} 
                  className={getInputClass('designation')} 
                />
              </div>
              <div>
                <label className={labelClass}>Primary Skill *</label>
                <input 
                  required 
                  name="skill" 
                  placeholder={isEmergency ? "e.g. Medical Rescue / Hazardous Waste Cleanup" : "e.g. Pipeline Repair, Diver"} 
                  value={formData.skill} 
                  onChange={handleChange} 
                  className={getInputClass('skill')} 
                />
              </div>
              <div>
                <label className={labelClass}>Experience (Years) *</label>
                <input 
                  required 
                  type="number" 
                  min="0" 
                  name="experience" 
                  value={formData.experience} 
                  onChange={handleChange} 
                  className={getInputClass('experience')} 
                />
              </div>

              <div>
                <label className={labelClass}>Joining Date</label>
                <input
                  type="date"
                  max={todayStr}
                  name="joining_date"
                  value={formData.joining_date || ''}
                  onChange={handleChange}
                  className={getInputClass('joining_date')}
                />
              </div>
            </div>
          )}

          {isEditMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className={labelClass}>Availability Status</label>
                <select 
                  name="availability" 
                  value={formData.availability} 
                  onChange={handleChange} 
                  className={getSelectClass()}
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="ON_BREAK">On Break</option>
                  <option value="BUSY">Busy</option>
                  <option value="ON_LEAVE">On Leave</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Employment Status</label>
                <select 
                  name="employment_status" 
                  value={formData.employment_status} 
                  onChange={handleChange} 
                  className={getSelectClass()}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Security Credentials */}
        {!isEditMode && (
          <div className={`p-6 md:p-8 ${isEmergency ? 'bg-slate-950/20' : 'bg-slate-50/50'}`}>
            <h2 className={`text-md font-bold uppercase tracking-wider mb-5 flex items-center gap-2 ${
              isEmergency ? 'text-rose-500' : 'text-slate-900'
            }`}>
              <span className={`material-symbols-outlined ${isEmergency ? 'text-rose-500' : 'text-blue-600'}`}>lock</span>
              Account Credentials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Username *</label>
                <input 
                  required 
                  type="text" 
                  name="username" 
                  placeholder="Enter a username"
                  value={formData.username || ''} 
                  onChange={handleChange} 
                  className={getInputClass('username')} 
                />
                {fieldErrors.username && (
                  <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.username}</p>
                )}
              </div>
              <div>
                {/* empty block just to align password fields on next line */}
              </div>
              <div>
                <label className={labelClass}>Password *</label>
                <input 
                  required 
                  type="password" 
                  name="password" 
                  placeholder="Minimum 8 characters"
                  value={formData.password} 
                  onChange={handleChange} 
                  className={getInputClass('password')} 
                />
                {fieldErrors.password && (
                  <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.password}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Confirm Password *</label>
                <input 
                  required 
                  type="password" 
                  name="confirm_password" 
                  placeholder="Re-enter password"
                  value={formData.confirm_password} 
                  onChange={handleChange} 
                  className={getInputClass('confirm_password')} 
                />
                {fieldErrors.confirm_password && (
                  <p className="text-xs font-semibold text-rose-500 mt-1 block">{fieldErrors.confirm_password}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className={`p-6 border-t flex items-center justify-end gap-4 ${
          isEmergency ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <button
            type="button"
            onClick={() => navigate(`/${department}/workers`)}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-colors uppercase tracking-wider ${
              isEmergency ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className={`px-8 py-3 rounded-xl font-bold text-xs text-white ${primaryBtnClass} transition-all shadow-sm disabled:opacity-70 flex items-center gap-2 uppercase tracking-wider`}
          >
            {isSaving && <span className="material-symbols-outlined animate-spin text-sm">sync</span>}
            {isSaving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Register Field Worker')}
          </button>
        </div>

      </form>
    </div>
  );
}
