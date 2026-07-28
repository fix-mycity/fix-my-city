import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getWorkerById, createWorker, updateWorker, uploadWorkerPhoto } from '../../services/workerService';

export default function WorkerForm({ department }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const todayStr = new Date().toISOString().split('T')[0];

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
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
        const detail = error.response?.data?.detail;
        toast.error(typeof detail === 'string' ? detail : 'Failed to upload photo');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditMode && formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.joining_date && formData.joining_date > todayStr) {
      toast.error("Joining date cannot be in the future. Please select today or a past date.");
      return;
    }

    setIsSaving(true);
    try {
      if (isEditMode) {
        const { username, email, password, confirm_password, state, district, pincode, created_at, ...updateData } = formData;
        if (updateData.joining_date) {
          updateData.joining_date = new Date(updateData.joining_date).toISOString();
        } else {
          delete updateData.joining_date;
        }
        if (updateData.photo) {
          updateData.photo = updateData.photo.split('?')[0];
        }
        await updateWorker(id, updateData, department);
        toast.success("Worker profile updated successfully");
      } else {
        // Auto-generate clean username from email or name
        let cleanUsername = formData.email ? formData.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') : '';
        if (cleanUsername.length < 3) {
          const fn = (formData.first_name || 'worker').toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
          const ln = (formData.last_name || 'user').toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
          cleanUsername = `${fn}_${ln}_${Math.floor(100 + Math.random() * 900)}`;
        }

        const payload = {
          ...formData,
          username: cleanUsername,
          place: formData.district || 'Municipal Zone'
        };

        if (payload.joining_date) {
          payload.joining_date = new Date(payload.joining_date).toISOString();
        } else {
          delete payload.joining_date;
        }

        if (payload.photo) {
          payload.photo = payload.photo.split('?')[0];
        }

        await createWorker(payload, department);
        toast.success("Worker registered successfully!");
      }
      navigate(`/${department}/workers`);
    } catch (err) {
      console.error("Registration error:", err);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        toast.error(detail[0]?.msg || "Worker registration failed");
      } else {
        toast.error(typeof detail === 'string' ? detail : (isEditMode ? "Failed to update profile" : "Failed to register worker"));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const buttonClasses = {
    water: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    traffic: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
    default: 'bg-slate-700 hover:bg-slate-800 focus:ring-slate-500'
  };
  const primaryBtnClass = buttonClasses[department] || buttonClasses.default;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-10 flex justify-center items-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-slate-400">sync</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          type="button"
          onClick={() => navigate(`/${department}/workers`)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isEditMode ? 'Edit Field Worker Profile' : 'Register New Field Worker'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {department === 'water' ? 'Water Authority Department' : department === 'traffic' ? 'Traffic Control Unit' : 'City Operations Department'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Profile Photo Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-md flex items-center justify-center">
              {isUploading ? (
                <div className="animate-pulse flex items-center justify-center w-full h-full bg-slate-200">
                  <span className="material-symbols-outlined text-slate-400 animate-spin">sync</span>
                </div>
              ) : formData.photo ? (
                <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-slate-300 text-5xl">person</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors border-2 border-white cursor-pointer disabled:opacity-50">
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
            <h3 className="text-base font-semibold text-slate-800">Profile Photo</h3>
            <p className="text-xs text-slate-500 mt-1">Upload a professional field officer photo (JPEG, PNG • Max 2MB).</p>
          </div>
        </div>

        {/* Section 1: Personal Details */}
        <div className="p-6 md:p-8 border-b border-slate-100">
          <h2 className="text-md font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">badge</span>
            Personal Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">First Name *</label>
              <input 
                required 
                type="text" 
                name="first_name" 
                placeholder="e.g. Abhinav" 
                value={formData.first_name} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Last Name *</label>
              <input 
                required 
                type="text" 
                name="last_name" 
                placeholder="e.g. Kumar" 
                value={formData.last_name} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Email Address *</label>
              <input 
                required 
                type="email" 
                name="email" 
                disabled={isEditMode}
                placeholder="e.g. officer@fixmycity.gov" 
                value={formData.email} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Phone Number *</label>
              <input 
                required 
                type="tel" 
                name="phone" 
                placeholder="e.g. 9846012345" 
                value={formData.phone} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Gender</label>
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Emergency Contact Phone</label>
              <input 
                type="tel" 
                name="emergency_contact_phone" 
                placeholder="e.g. 9846998877" 
                value={formData.emergency_contact_phone} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
              />
            </div>
          </div>
        </div>

        {/* Section 2: Location Details */}
        <div className="p-6 md:p-8 border-b border-slate-100">
          <h2 className="text-md font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">location_on</span>
            Location Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {!isEditMode ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">State *</label>
                  <input 
                    required 
                    name="state" 
                    placeholder="Kerala" 
                    value={formData.state} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">District *</label>
                  <input 
                    required 
                    name="district" 
                    placeholder="e.g. Malappuram" 
                    value={formData.district} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Pincode *</label>
                  <input 
                    required 
                    name="pincode" 
                    placeholder="e.g. 676505" 
                    value={formData.pincode} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                  />
                </div>
              </>
            ) : (
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Assigned District / Zone</label>
                <input 
                  name="district" 
                  placeholder="e.g. Malappuram" 
                  value={formData.district} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Professional & Employment Details */}
        <div className="p-6 md:p-8 border-b border-slate-100">
          <h2 className="text-md font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">work</span>
            Employment & Skill Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Designation *</label>
              <input 
                required 
                name="designation" 
                placeholder="e.g. Senior Technician" 
                value={formData.designation} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Primary Skill *</label>
              <input 
                required 
                name="skill" 
                placeholder="e.g. Pipeline Repair, Diver" 
                value={formData.skill} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Experience (Years) *</label>
              <input 
                required 
                type="number" 
                min="0" 
                name="experience" 
                value={formData.experience} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Joining Date</label>
              <input
                type="date"
                max={todayStr}
                name="joining_date"
                value={formData.joining_date || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
              />
            </div>

            {isEditMode && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Availability Status</label>
                  <select 
                    name="availability" 
                    value={formData.availability} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="BUSY">Busy</option>
                    <option value="ON_LEAVE">On Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Employment Status</label>
                  <select 
                    name="employment_status" 
                    value={formData.employment_status} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 4: Security Credentials */}
        {!isEditMode && (
          <div className="p-6 md:p-8 bg-slate-50/50">
            <h2 className="text-md font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">lock</span>
              Account Credentials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Password *</label>
                <input 
                  required 
                  type="password" 
                  name="password" 
                  placeholder="Minimum 8 characters"
                  value={formData.password} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Confirm Password *</label>
                <input 
                  required 
                  type="password" 
                  name="confirm_password" 
                  placeholder="Re-enter password"
                  value={formData.confirm_password} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white" 
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(`/${department}/workers`)}
            className="px-6 py-2.5 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-200 transition-colors uppercase tracking-wider"
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
