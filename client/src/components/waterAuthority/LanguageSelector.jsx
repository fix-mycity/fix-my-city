import React from "react";

export default function LanguageSelector({ value, onChange }) {
  const options = [
    { code: "en", label: "English (US)" },
    { code: "hi", label: "Hindi (हिन्दी)" },
    { code: "mr", label: "Marathi (मराठी)" },
    { code: "es", label: "Spanish (Español)" }
  ];

  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Language</label>
      <select
        value={value || "en"}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
      >
        {options.map((opt) => (
          <option key={opt.code} value={opt.code}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
