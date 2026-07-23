import React from "react";

export default function CitizenNotificationHistory({ notifications = [] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Notification & Alerts Logs</h3>
      {notifications.length === 0 ? (
        <p className="text-sm text-slate-500 py-4 text-center">No alerts broadcast to this citizen.</p>
      ) : (
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
          {notifications.map((n) => (
            <div key={n.id} className="bg-slate-950/40 border border-slate-800/80 p-3 rounded-lg flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">{n.notification_type}</span>
                <h4 className="text-sm text-white font-medium mt-0.5">{n.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1">{n.message}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">{n.delivery_channel}</span>
                <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold mt-2 ${
                  n.status === "SENT" ? "bg-emerald-500/20 text-emerald-450" : "bg-red-500/20 text-red-400"
                }`}>
                  {n.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
