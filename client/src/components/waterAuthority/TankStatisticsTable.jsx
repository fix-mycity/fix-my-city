import React from "react";

export default function TankStatisticsTable({ totalCapacity = 0, currentLevel = 0, lowWaterTanks = 0 }) {
  const percent = totalCapacity > 0 ? (currentLevel / totalCapacity) * 100 : 0;
  return (
    <div className="space-y-4">
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Combined Reservoir Levels</span>
          <h3 className="text-xl font-bold text-white mt-1">{currentLevel.toLocaleString()} / {totalCapacity.toLocaleString()} Liters</h3>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-blue-400">{percent.toFixed(1)}%</span>
          <p className="text-xs text-slate-400">Total capacity usage</p>
        </div>
      </div>
      <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" style={{ width: `${percent}%` }} />
      </div>
      <div className="flex justify-between text-sm text-slate-400 mt-2 px-1">
        <span>Low-Level Outages: <strong className="text-red-400">{lowWaterTanks} tanks</strong></span>
        <span>Secure Reserves: <strong className="text-emerald-400">Stable</strong></span>
      </div>
    </div>
  );
}
