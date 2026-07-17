import React, { useState, useEffect, useRef } from 'react';
import { HardHat, MapPin, Mail, Lock, CheckCircle2, User, Phone, Briefcase, Calendar, Camera, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TrafficWorkerForm({ initialData = null, onSubmit, onCancel }) {
  const isEdit = !!initialData;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    state: '',
    district: '',
    pincode: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone: '',
    photo: '',
    gender: '',
    date_of_birth: '',
    address: '',
    place: '',
    designation: '',
    skill: '',
    experience: '',
    emergency_contact_phone: '',
    availability: 'AVAILABLE',
    employment_status: 'ACTIVE'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        date_of_birth: initialData.date_of_birth ? initialData.date_of_birth.split('T')[0] : '',
        experience: initialData.experience || ''
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'pincode' || name === 'phone' || name === 'emergency_contact_phone' || name === 'experience') {
      if (!/^[0-9]*$/.test(value)) return;
    }

    if (name === 'username' || name === 'first_name' || name === 'last_name') {
      if (!/^[a-zA-Z\s_.]*$/.test(value)) return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!isEdit) {
      if (!formData.username) newErrors.username = 'Username is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password && formData.password.length < 8) newErrors.password = 'Min 8 chars';
      if (formData.password !== formData.confirm_password) newErrors.confirm_password = 'Passwords do not match';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.pincode) newErrors.pincode = 'Pincode is required';
      if (formData.pincode && formData.pincode.length !== 6) newErrors.pincode = 'Must be 6 digits';
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.district) newErrors.district = 'District is required';
    } else {
       // In edit mode, password is not allowed to be changed from this UI as requested
    }

    if (!formData.first_name) newErrors.first_name = 'First Name is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';

    if (formData.date_of_birth) {
      const today = new Date();
      const dob = new Date(formData.date_of_birth);
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (age < 18) {
        toast.error('Worker must be at least 18 years old.');
        return false; // return false early so it doesn't submit
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const payload = { ...formData };
      if (payload.date_of_birth === '') {
        delete payload.date_of_birth;
      }
      if (payload.experience === '') {
        delete payload.experience;
      } else {
        payload.experience = parseInt(payload.experience, 10);
      }
      // joining_date is handled by the backend automatically
      onSubmit(payload);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
          <HardHat className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Field Worker' : 'Register Field Worker'}</h2>
          <p className="text-sm text-slate-500 font-medium">
            {isEdit ? 'Update worker details and profile information.' : 'Create a new field worker account for the Traffic Command Center.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Photo Upload Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-md flex items-center justify-center">
              {formData.photo ? (
                <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-slate-300" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-amber-600 transition-colors border-4 border-white"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handlePhotoUpload} 
            />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Profile Photo</h3>
            <p className="text-sm text-slate-500 mb-2">Upload a professional photo. Max size 2MB.</p>
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Choose Image
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          
          {/* Account Settings (Only shown clearly if New, else less emphasized) */}
          {!isEdit && (
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" />
                Account Credentials
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username <span className="text-red-500">*</span></label>
                  <input
                    type="text" name="username" value={formData.username} onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.username ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-slate-200 focus:ring-slate-800'} focus:outline-none focus:ring-2`}
                    disabled={isEdit}
                  />
                  {errors.username && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.username}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.email ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-slate-200 focus:ring-slate-800'} focus:outline-none focus:ring-2`}
                    disabled={isEdit}
                  />
                  {errors.email && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.email}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                <input
                  type="text" name="first_name" value={formData.first_name} onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-lg border ${errors.first_name ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-slate-200 focus:ring-slate-800'} focus:outline-none focus:ring-2`}
                />
                {errors.first_name && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.first_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Last Name</label>
                <input
                  type="text" name="last_name" value={formData.last_name} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-slate-800 focus:outline-none focus:ring-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gender</label>
                <select 
                  name="gender" value={formData.gender} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-slate-800 focus:outline-none focus:ring-2"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date of Birth</label>
                <input
                  type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-slate-800 focus:outline-none focus:ring-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
              <input
                type="text" name="phone" value={formData.phone} onChange={handleChange} maxLength={15}
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.phone ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-slate-200 focus:ring-slate-800'} focus:outline-none focus:ring-2`}
              />
              {errors.phone && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.phone}</p>}
            </div>
          </div>

          {/* Professional Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-400" />
              Professional Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Designation</label>
                <input
                  type="text" name="designation" value={formData.designation} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-slate-800 focus:outline-none focus:ring-2"
                  placeholder="e.g. Traffic Marshal"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Primary Skill</label>
                <select 
                  name="skill" value={formData.skill} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-slate-800 focus:outline-none focus:ring-2"
                >
                  <option value="">Select Skill</option>
                  <option value="Traffic Control">Traffic Control</option>
                  <option value="Incident Response">Incident Response</option>
                  <option value="Road Maintenance">Road Maintenance</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Experience (Yrs)</label>
                <input
                  type="text" name="experience" value={formData.experience} onChange={handleChange} maxLength={2}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-slate-800 focus:outline-none focus:ring-2"
                />
              </div>
            </div>

            {isEdit && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Status</label>
                  <select 
                    name="availability" value={formData.availability} onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-slate-800 focus:outline-none focus:ring-2"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="ON_WORK">On Work / Busy</option>
                    <option value="ON_LEAVE">On Leave</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Location Details */}
          <div className="space-y-4 md:col-span-2 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              Address & Location
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Address</label>
                <textarea
                  name="address" value={formData.address} onChange={handleChange} rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-slate-800 focus:outline-none focus:ring-2"
                />
              </div>
              
              {!isEdit && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">State <span className="text-red-500">*</span></label>
                    <input
                      type="text" name="state" value={formData.state} onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.state ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-slate-200 focus:ring-slate-800'} focus:outline-none focus:ring-2`}
                    />
                    {errors.state && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.state}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">District <span className="text-red-500">*</span></label>
                    <input
                      type="text" name="district" value={formData.district} onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.district ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-slate-200 focus:ring-slate-800'} focus:outline-none focus:ring-2`}
                    />
                    {errors.district && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.district}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pincode <span className="text-red-500">*</span></label>
                    <input
                      type="text" name="pincode" value={formData.pincode} onChange={handleChange} maxLength={6}
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.pincode ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-slate-200 focus:ring-slate-800'} focus:outline-none focus:ring-2`}
                    />
                    {errors.pincode && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.pincode}</p>}
                  </div>
                </>
              )}
              
              {isEdit && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Place / City</label>
                  <input
                    type="text" name="place" value={formData.place} onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-slate-800 focus:outline-none focus:ring-2"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Security */}
          {!isEdit && (
            <div className="space-y-4 md:col-span-2 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" />
                Security
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                  <input
                    type="password" name="password" value={formData.password} onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.password ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-slate-200 focus:ring-slate-800'} focus:outline-none focus:ring-2`}
                    placeholder="Min 8 characters"
                  />
                  {errors.password && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password <span className="text-red-500">*</span></label>
                  <input
                    type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.confirm_password ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-slate-200 focus:ring-slate-800'} focus:outline-none focus:ring-2`}
                    placeholder="Re-enter password"
                  />
                  {errors.confirm_password && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.confirm_password}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="pt-8 mt-8 border-t border-slate-100 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isEdit ? 'Save Changes' : 'Register Worker'}
          </button>
        </div>
      </form>
    </div>
  );
}
