import React from "react";

export default function QualityStatisticsTable({ safe = 0, warning = 0, unsafe = 0, avgPh = 7.0, avgTds = 250 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">pH Average</span>
        <h4 className="text-2xl font-bold text-emerald-400 mt-2 font-mono">{avgPh}</h4>
        <p className="text-[11px] text-slate-450 mt-1">Neutral Safe Range (6.5 - 8.5)</p>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">TDS Average</span>
        <h4 className="text-2xl font-bold text-blue-400 mt-2 font-mono">{avgTds} ppm</h4>
        <p className="text-[11px] text-slate-450 mt-1">Ideal Standards: &lt;300 ppm</p>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Safety Status Index</span>
        <div className="flex justify-around items-center mt-3 text-xs">
          <div className="text-center">
            <span className="text-emerald-450 font-bold">{safe}</span>
            <p className="text-[10px] text-slate-400">Safe</p>
          </div>
          <div className="text-center">
            <span className="text-amber-455 font-bold">{warning}</span>
            <p className="text-[10px] text-slate-400">Warn</p>
          </div>
          <div className="text-center">
            <span className="text-rose-455 font-bold">{unsafe}</span>
            <p className="text-[10px] text-slate-400">Unsafe</p>
          </div>
        </div>
      </div>
    </div>
  );
}
