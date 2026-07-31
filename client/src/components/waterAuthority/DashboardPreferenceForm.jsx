import React from "react";

export default function DashboardPreferenceForm({ settings = {}, onChange }) {
  const intervals = [
    { value: 10, label: "Every 10 Seconds" },
    { value: 30, label: "Every 30 Seconds" },
    { value: 60, label: "Every 1 Minute" },
    { value: 300, label: "Every 5 Minutes" }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Dashboard Settings</h3>
      
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wide">Refresh Interval</label>
        <select
          value={settings.dashboard_refresh_interval || 30}
          onChange={(e) => onChange({ dashboard_refresh_interval: parseInt(e.target.value) })}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
        >
          {intervals.map((int) => (
            <option key={int.value} value={int.value}>{int.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
