import React from "react";
import CitizenStatusBadge from "./CitizenStatusBadge";

export default function CitizenProfileCard({ citizen = {} }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
        <div className="h-16 w-16 bg-slate-950 rounded-full flex items-center justify-center border border-slate-800 text-slate-350">
          <span className="material-icons text-3xl">account_circle</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{citizen.full_name || "Anonymous Citizen"}</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Citizen ID: #{citizen.user_id}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
          <span className="text-sm text-slate-200">{citizen.email}</span>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</span>
          <span className="text-sm text-slate-200 font-mono">{citizen.phone_number || "Not Configured"}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ward</span>
            <span className="text-sm text-white font-semibold">{citizen.ward || "Not Configured"}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Area</span>
            <span className="text-sm text-white font-semibold">{citizen.area || "Not Configured"}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registered Date</span>
            <span className="text-sm text-slate-350">{citizen.registered_date || "N/A"}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Service Access</span>
            <div className="mt-1">
              <CitizenStatusBadge status={citizen.service_status} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
