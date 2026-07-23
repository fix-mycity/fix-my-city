import React from "react";

export default function CitizenFilter({ filters, onChange, onClear }) {
  const wards = Array.from({ length: 25 }, (_, i) => `Ward ${i + 1}`);
  const areas = [
    "Shanti Nagar", "Green Glen", "Central Square", "Metro Hub", 
    "Riverside", "Fort", "West End", "Lakeview", "South Hill"
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
      <div className="flex flex-wrap gap-3 items-center flex-1">
        <div className="w-40">
          <select
            value={filters.ward || ""}
            onChange={(e) => onChange({ ward: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
          >
            <option value="">All Wards</option>
            {wards.map((w, idx) => (
              <option key={idx} value={w}>{w}</option>
            ))}
          </select>
        </div>

        <div className="w-40">
          <select
            value={filters.area || ""}
            onChange={(e) => onChange({ area: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
          >
            <option value="">All Areas</option>
            {areas.map((a, idx) => (
              <option key={idx} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div className="w-40">
          <select
            value={filters.status || ""}
            onChange={(e) => onChange({ status: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
          >
            <option value="">All Access States</option>
            <option value="ENABLED">ENABLED</option>
            <option value="DISABLED">DISABLED</option>
          </select>
        </div>

        {(filters.ward || filters.area || filters.status) && (
          <button
            onClick={onClear}
            className="text-xs text-red-400 hover:text-red-300 font-semibold transition"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
