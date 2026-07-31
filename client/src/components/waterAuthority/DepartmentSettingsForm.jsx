import React from "react";

export default function DepartmentSettingsForm({ settings = {}, onChange }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Department Identity</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wide">Department Name</label>
          <input
            type="text"
            value={settings.department_name || ""}
            onChange={(e) => onChange({ department_name: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-455 uppercase tracking-wide">Department Code</label>
          <input
            type="text"
            value={settings.department_code || ""}
            onChange={(e) => onChange({ department_code: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>
    </div>
  );
}
