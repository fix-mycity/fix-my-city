import React from "react";

export default function CitizenSearch({ value, onChange }) {
  return (
    <div className="relative flex-1">
      <span className="material-icons absolute left-3 top-2.5 text-slate-400">search</span>
      <input
        type="text"
        placeholder="Search citizen by Name, Email or Phone..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
      />
    </div>
  );
}
