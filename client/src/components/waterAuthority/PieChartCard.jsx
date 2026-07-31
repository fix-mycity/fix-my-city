import React from "react";

export default function PieChartCard({ title, data = {} }) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const total = values.reduce((sum, v) => sum + v, 0);

  const colors = [
    "#3b82f6", // blue
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#6b7280"  // gray
  ];

  // Map slices
  let accumulatedPercent = 0;
  const slices = keys.map((key, idx) => {
    const val = data[key];
    const pct = total > 0 ? val / total : 0;
    const strokeDasharray = `${pct * 439.8} 439.8`;
    const strokeDashoffset = -accumulatedPercent * 439.8;
    accumulatedPercent += pct;

    return {
      key,
      val,
      pct: Math.round(pct * 100),
      strokeDasharray,
      strokeDashoffset,
      color: colors[idx % colors.length]
    };
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col md:flex-row items-center gap-6">
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">{title}</h3>
        {total === 0 ? (
          <div className="h-[140px] flex items-center justify-center text-slate-500 text-sm">
            No Data Recorded
          </div>
        ) : (
          <div className="space-y-3">
            {slices.map((slice, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }} />
                  <span className="text-slate-300 font-medium">{slice.key}</span>
                </div>
                <span className="text-white font-semibold">
                  {slice.val} ({slice.pct}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {total > 0 && (
        <div className="relative w-[180px] h-[180px]">
          <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
            {/* Doughnut background */}
            <circle cx="100" cy="100" r="70" fill="transparent" stroke="#1e293b" strokeWidth="22" />
            
            {/* Slices */}
            {slices.map((slice, idx) => (
              <circle
                key={idx}
                cx="100"
                cy="100"
                r="70"
                fill="transparent"
                stroke={slice.color}
                strokeWidth="22"
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap={slice.pct > 0 ? "round" : "butt"}
                className="transition-all duration-300 hover:stroke-[25px]"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-slate-400 uppercase font-semibold">Total</span>
            <span className="text-xl font-bold text-white mt-0.5">{total}</span>
          </div>
        </div>
      )}
    </div>
  );
}
