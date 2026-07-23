import React from "react";

export default function MaintenanceStatisticsTable({ total = 0, progress = 0, completed = 0, estCost = 0, actCost = 0 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Cost Summaries (INR)</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Total Budget Estimated</span>
            <span className="font-semibold text-white font-mono">₹{estCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Actual Outlay Incurred</span>
            <span className="font-semibold text-emerald-450 font-mono">₹{actCost.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-emerald-500 h-full" style={{ width: estCost > 0 ? `${(actCost/estCost)*100}%` : "0%" }} />
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Tasks Status Metrics</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Scheduled/In Progress Requests</span>
            <span className="font-semibold text-blue-400 font-mono">{progress} tasks</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Successfully Completed</span>
            <span className="font-semibold text-emerald-400 font-mono">{completed} tasks</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Total Request Records</span>
            <span className="font-semibold text-white font-mono">{total} records</span>
          </div>
        </div>
      </div>
    </div>
  );
}
