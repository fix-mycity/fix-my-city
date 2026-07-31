import React from "react";

export default function ReportPreferenceForm({ settings = {}, onChange }) {
  const formats = ["PDF", "EXCEL", "CSV"];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Report Export Default Format</h3>
      
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wide">Default Export Format</label>
        <select
          value={settings.report_default_format || "PDF"}
          onChange={(e) => onChange({ report_default_format: e.target.value })}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
        >
          {formats.map((f, idx) => (
            <option key={idx} value={f}>{f}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
