import React from "react";

export default function CitizenComplaintHistory({ complaints = [] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Citizen Complaint History</h3>
      {complaints.length === 0 ? (
        <p className="text-sm text-slate-500 py-4 text-center">No complaints logged by this citizen.</p>
      ) : (
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
          {complaints.map((c) => (
            <div key={c.id} className="bg-slate-950/40 border border-slate-800/80 p-3 rounded-lg flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-blue-400 font-semibold">{c.complaint_number}</span>
                <h4 className="text-sm text-white font-medium mt-0.5">{c.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1">Ward: {c.ward} | Area: {c.area}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  c.status === "RESOLVED" || c.status === "VERIFIED" ? "bg-emerald-500/20 text-emerald-450" : "bg-blue-500/20 text-blue-450"
                }`}>
                  {c.status}
                </span>
                <p className="text-[10px] text-slate-500 mt-2">{new Date(c.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
