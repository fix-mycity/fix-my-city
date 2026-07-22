import React from 'react';
import WorkerStatusBadge from './WorkerStatusBadge';
import WorkerAvailabilityBadge from './WorkerAvailabilityBadge';

export default function WorkerProfileCard({ worker, onEditClick, onBackClick }) {
  if (!worker) return null;

  const {
    id,
    first_name,
    last_name,
    username,
    email,
    phone,
    photo,
    gender,
    date_of_birth,
    address,
    place,
    pincode,
    pin_code,
    state,
    district,
    department,
    designation,
    skill,
    experience,
    joining_date,
    availability,
    employment_status,
    emergency_contact_phone,
    is_active
  } = worker;

  const fullName = `${first_name || ''} ${last_name || ''}`.trim() || username || 'Field Worker';
  const effectivePincode = pincode || pin_code || 'N/A';

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header Controls */}
      <div className="flex justify-between items-center">
        {onBackClick && (
          <button 
            onClick={onBackClick}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium text-sm transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to List
          </button>
        )}
        {onEditClick && (
          <button 
            onClick={() => onEditClick(id)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm ml-auto"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
            Edit Profile
          </button>
        )}
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-6 md:p-8 text-white relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar */}
            <div className="w-28 h-28 rounded-2xl bg-white/10 backdrop-blur border-2 border-white/20 overflow-hidden shrink-0 flex items-center justify-center shadow-lg">
              {photo ? (
                <img src={photo} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-5xl text-white/70">person</span>
              )}
            </div>

            {/* Info Summary */}
            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <h1 className="text-2xl font-bold tracking-tight text-white truncate">{fullName}</h1>
                {department && (
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                    {department === 'water' ? 'Water Authority' : department === 'traffic' ? 'Traffic Control' : department}
                  </span>
                )}
              </div>

              <p className="text-slate-300 font-medium text-sm mb-3">
                {designation || 'Field Technician'} • Username: <span className="text-white font-mono">{username || 'N/A'}</span>
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <WorkerAvailabilityBadge availability={availability} />
                <WorkerStatusBadge status={is_active === false ? 'BLOCKED' : employment_status} />
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">
          
          {/* Contact & Account Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-blue-600 text-lg">contact_mail</span>
              Contact & Account Info
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 font-medium block mb-1">Email Address</span>
                <span className="font-medium text-slate-800 break-all">{email || 'Not provided'}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 font-medium block mb-1">Phone Number</span>
                <span className="font-medium text-slate-800">{phone || 'Not provided'}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 sm:col-span-2">
                <span className="text-xs text-slate-400 font-medium block mb-1">Emergency Contact</span>
                <span className="font-medium text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-rose-500 text-base">emergency</span>
                  {emergency_contact_phone || 'Not provided'}
                </span>
              </div>
            </div>
          </div>

          {/* Job & Skill Assignment */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-blue-600 text-lg">badge</span>
              Job & Skill Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 font-medium block mb-1">Primary Skill</span>
                <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block">
                  {skill || 'General Field Operations'}
                </span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 font-medium block mb-1">Experience</span>
                <span className="font-medium text-slate-800">{experience || 0} {experience === 1 ? 'Year' : 'Years'}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 font-medium block mb-1">Designation</span>
                <span className="font-medium text-slate-800">{designation || 'Field Worker'}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 font-medium block mb-1">Joining Date</span>
                <span className="font-medium text-slate-800">{formatDate(joining_date)}</span>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-blue-600 text-lg">location_on</span>
              Location & Jurisdiction
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 font-medium block mb-1">Assigned Zone / Place</span>
                <span className="font-medium text-slate-800">{place || 'Unassigned Zone'}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 font-medium block mb-1">District</span>
                <span className="font-medium text-slate-800">{district || 'N/A'}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 font-medium block mb-1">State</span>
                <span className="font-medium text-slate-800">{state || 'N/A'}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 font-medium block mb-1">Pincode</span>
                <span className="font-medium text-slate-800">{effectivePincode}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
