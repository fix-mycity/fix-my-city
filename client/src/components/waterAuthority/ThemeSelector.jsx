import React from "react";

export default function ThemeSelector({ value, onChange }) {
  const options = [
    { code: "dark", label: "Midnight Dark (Default)" },
    { code: "light", label: "Classic Light" },
    { code: "blue", label: "Ocean Blue Theme" },
    { code: "emerald", label: "Forest Green Theme" }
  ];

  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Color Theme</label>
      <select
        value={value || "dark"}
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
