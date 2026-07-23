import React from "react";

export default function NotificationStatisticsTable({ totalSent = 0, successRate = 100.0, byChannel = {}, byType = {} }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Broadcast Volume</h4>
        <div className="text-center py-4">
          <h2 className="text-3xl font-extrabold text-white font-mono">{totalSent}</h2>
          <p className="text-xs text-slate-400 mt-2">Notifications dispatched</p>
        </div>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Channels Used</h4>
        <div className="space-y-2">
          {Object.keys(byChannel).length === 0 ? (
            <p className="text-sm text-slate-500 py-1">No channels</p>
          ) : (
            Object.keys(byChannel).map((ch, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-slate-800/40">
                <span className="text-slate-400">{ch}</span>
                <span className="font-semibold text-white">{byChannel[ch]}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Success Performance</h4>
        <div className="text-center py-4">
          <h2 className="text-3xl font-extrabold text-emerald-400 font-mono">{successRate}%</h2>
          <p className="text-xs text-slate-400 mt-2">Delivery SLA accuracy</p>
        </div>
      </div>
    </div>
  );
}
