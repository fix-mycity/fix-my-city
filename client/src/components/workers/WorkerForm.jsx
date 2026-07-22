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
    joining_date: '',
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
      
      let formattedJoiningDate = '';
      if (data.joining_date) {
        try {
          formattedJoiningDate = new Date(data.joining_date).toISOString().split('T')[0];
        } catch (e) {
          formattedJoiningDate = '';
        }
      }

      setFormData(prev => ({
        ...prev,
        ...data,
        joining_date: formattedJoiningDate,
        password: '', // Never populate password on edit
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
        toast.error('Failed to upload photo to S3');
        console.error(error);
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
        toast.success("Worker updated successfully");
      } else {
        const payload = { ...formData };
        if (payload.joining_date) {
          payload.joining_date = new Date(payload.joining_date).toISOString();
        } else {
          delete payload.joining_date;
        }
        if (payload.photo) {
          payload.photo = payload.photo.split('?')[0];
        }
        await createWorker(payload, department);
        toast.success("Worker registered successfully");
      }
      navigate(`/${department}/workers`);
    } catch (err) {
      toast.error(err.response?.data?.detail || (isEditMode ? "Failed to update" : "Failed to register"));
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
            {department === 'water' ? 'Water Authority' : department === 'traffic' ? 'Traffic Control' : ''} Department
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
                <input required name="username" value={formData.username} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input type="email" required name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                <input type="password" required name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password *</label>
                <input type="password" required name="confirm_password" value={formData.confirm_password} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
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
              <input name="first_name" value={formData.first_name} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input name="last_name" value={formData.last_name} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact</label>
              <input name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
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
                  <input required name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">District *</label>
                  <input required name="district" value={formData.district} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pincode *</label>
                  <input required name="pincode" value={formData.pincode} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </>
            )}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Place / Zone</label>
              <input name="place" value={formData.place} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">work</span>
            Employment Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
              <input name="designation" value={formData.designation} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Primary Skill</label>
              <input name="skill" value={formData.skill} onChange={handleChange} placeholder="e.g. Electrician, Diver" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Experience (Years)</label>
              <input type="number" min="0" name="experience" value={formData.experience} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Joining Date</label>
              <input 
                type="date" 
                max={todayStr} 
                name="joining_date" 
                value={formData.joining_date || ''} 
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">Cannot be in the future</span>
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
