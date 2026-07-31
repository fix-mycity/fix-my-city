import React from "react";

export default function EmergencyStatisticsTable({ total = 0, active = 0, resolved = 0, avgResponse = 0, wards = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Outage Statistics</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Active Incidents</span>
            <span className="font-semibold text-rose-455 font-mono">{active} incidents</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Resolved Incidents</span>
            <span className="font-semibold text-emerald-450 font-mono">{resolved} closed</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Total Logged Emergencies</span>
            <span className="font-semibold text-white font-mono">{total} reports</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Response Times & Scope</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Avg Restoration Duration</span>
            <span className="font-semibold text-amber-400 font-mono">{avgResponse} minutes</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Scope of Affected Wards</span>
            <span className="font-semibold text-white font-mono">{wards.length} Wards</span>
          </div>
          <div className="text-[10px] text-slate-500 truncate max-w-full">
            Affected List: {wards.join(", ") || "None"}
          </div>
        </div>
      </div>
    </div>
  );
}
