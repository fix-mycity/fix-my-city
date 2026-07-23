import React from "react";

export default function ComplaintStatisticsTable({ complaints = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <th className="py-3 px-4">Ref Number</th>
            <th className="py-3 px-4">Subject Title</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Log Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {complaints.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-6 text-slate-500 text-sm">
                No Registered Complaints Logs Found
              </td>
            </tr>
          ) : (
            complaints.map((c, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30 transition text-sm text-slate-300">
                <td className="py-3 px-4 text-blue-400 font-mono font-medium">{c.number}</td>
                <td className="py-3 px-4 text-white">{c.title}</td>
                <td className="py-3 px-4 text-xs font-semibold text-slate-450 uppercase">{c.category}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.status === "RESOLVED" || c.status === "VERIFIED" ? "bg-emerald-500/20 text-emerald-450" : "bg-blue-500/20 text-blue-450"
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400 text-xs">{new Date(c.created_at).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
