import React from "react";

export default function WorkingHoursForm({ settings = {}, onChange }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Office Timings & Supply presets</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wide">Working Days</label>
          <input
            type="text"
            placeholder="e.g. Mon-Sat"
            value={settings.working_days || ""}
            onChange={(e) => onChange({ working_days: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wide">Working Hours</label>
          <input
            type="text"
            placeholder="e.g. 09:00 - 18:00"
            value={settings.working_hours || ""}
            onChange={(e) => onChange({ working_hours: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wide">Default Supply Start Time</label>
          <input
            type="text"
            placeholder="e.g. 06:00"
            value={settings.default_supply_start || ""}
            onChange={(e) => onChange({ default_supply_start: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wide">Default Supply End Time</label>
          <input
            type="text"
            placeholder="e.g. 09:00"
            value={settings.default_supply_end || ""}
            onChange={(e) => onChange({ default_supply_end: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>
    </div>
  );
}
