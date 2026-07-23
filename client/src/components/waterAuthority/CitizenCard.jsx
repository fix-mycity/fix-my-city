import React from "react";

export default function CitizenCard({ title, value, icon, color = "blue", description }) {
  const colorMap = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    rose: "text-rose-455 bg-rose-500/10 border-rose-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex items-center justify-between gap-4">
      <div>
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{title}</span>
        <h2 className="text-2xl font-bold text-white mt-1.5">{value}</h2>
        {description && <p className="text-[11px] text-slate-500 mt-1">{description}</p>}
      </div>
      <div className={`p-3 rounded-lg border ${colorMap[color] || colorMap.blue}`}>
        <span className="material-icons text-xl block">{icon}</span>
      </div>
    </div>
  );
}
