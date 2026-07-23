import React from "react";

export default function ReportFilter({ filters, onChange, onClear, onRefresh }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md mb-6 flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Ward Filter
        </label>
        <select
          name="ward"
          value={filters.ward || ""}
          onChange={handleChange}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All Wards</option>
          <option value="Ward 1">Ward 1</option>
          <option value="Ward 2">Ward 2</option>
          <option value="Ward 3">Ward 3</option>
          <option value="Ward 4">Ward 4</option>
          <option value="Ward 5">Ward 5</option>
          <option value="Ward 12">Ward 12</option>
        </select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Zone Filter
        </label>
        <select
          name="zone"
          value={filters.zone || ""}
          onChange={handleChange}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All Zones</option>
          <option value="Central Zone">Central Zone</option>
          <option value="West Zone">West Zone</option>
          <option value="East Zone">East Zone</option>
          <option value="South Zone">South Zone</option>
          <option value="North Zone">North Zone</option>
        </select>
      </div>

      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Start Date
        </label>
        <input
          type="date"
          name="start_date"
          value={filters.start_date || ""}
          onChange={handleChange}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          End Date
        </label>
        <input
          type="date"
          name="end_date"
          value={filters.end_date || ""}
          onChange={handleChange}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
        >
          <span className="material-icons text-sm">refresh</span>
          Refresh
        </button>
        <button
          onClick={onClear}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
