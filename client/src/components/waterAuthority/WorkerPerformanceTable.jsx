import React from "react";

export default function WorkerPerformanceTable({ workers = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <th className="py-3 px-4">Worker ID</th>
            <th className="py-3 px-4">Name</th>
            <th className="py-3 px-4">Completed Tasks</th>
            <th className="py-3 px-4">Avg Completion Time</th>
            <th className="py-3 px-4 text-right">Completion Rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {workers.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-6 text-slate-500 text-sm">
                No Worker Performance Data Found
              </td>
            </tr>
          ) : (
            workers.map((w, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30 transition text-sm text-slate-300">
                <td className="py-3 px-4 text-slate-500 font-mono">#{w.worker_id}</td>
                <td className="py-3 px-4 text-white font-medium">{w.name}</td>
                <td className="py-3 px-4">{w.tasks_completed} assignments</td>
                <td className="py-3 px-4">{w.avg_time_hours || "0.0"} hours</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${w.completion_rate_pct || 0}%` }} />
                    </div>
                    <span className="text-white font-semibold font-mono">{w.completion_rate_pct}%</span>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
