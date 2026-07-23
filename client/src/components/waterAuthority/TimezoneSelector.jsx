import React from "react";

export default function TimezoneSelector({ value, onChange }) {
  const timezones = [
    "IST (UTC+05:30)",
    "UTC (Coordinated Universal Time)",
    "GMT (Greenwich Mean Time)",
    "EST (UTC-05:00)",
    "PST (UTC-08:00)"
  ];

  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Timezone</label>
      <select
        value={value || "IST (UTC+05:30)"}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
      >
        {timezones.map((tz, idx) => (
          <option key={idx} value={tz}>{tz}</option>
        ))}
      </select>
    </div>
  );
}
