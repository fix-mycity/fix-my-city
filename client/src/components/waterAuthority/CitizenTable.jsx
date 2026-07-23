import React from "react";
import CitizenStatusBadge from "./CitizenStatusBadge";

export default function CitizenTable({ 
  citizens = [], 
  total = 0, 
  page = 1, 
  pageSize = 10, 
  onPageChange, 
  onView, 
  onToggleStatus 
}) {
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/40">
              <th className="py-3.5 px-4">Citizen ID</th>
              <th className="py-3.5 px-4">Name</th>
              <th className="py-3.5 px-4">Contact Info</th>
              <th className="py-3.5 px-4">Location (Ward/Area)</th>
              <th className="py-3.5 px-4">Service Status</th>
              <th className="py-3.5 px-4 text-center">Complaints</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850">
            {citizens.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-slate-500 text-sm">
                  No registered municipal citizens found matching current search.
                </td>
              </tr>
            ) : (
              citizens.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/20 transition text-sm text-slate-300">
                  <td className="py-4 px-4 font-mono text-slate-500">#{c.user_id}</td>
                  <td className="py-4 px-4 text-white font-medium">{c.full_name || "Anonymous Citizen"}</td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-450">{c.email}</span>
                      <span className="text-[11px] text-slate-500 font-mono mt-0.5">{c.phone_number || "No Phone"}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white">{c.ward || "Not Configured"}</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">{c.area || "Not Configured"}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <CitizenStatusBadge status={c.service_status} />
                  </td>
                  <td className="py-4 px-4 text-center font-bold font-mono text-blue-400">
                    {c.complaint_count}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onView(c.user_id)}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded text-xs transition flex items-center gap-1"
                      >
                        <span className="material-icons text-[14px]">visibility</span>
                        View
                      </button>
                      <button
                        onClick={() => onToggleStatus(c.user_id, c.service_status, c.ward, c.area)}
                        className={`px-2.5 py-1 rounded text-xs transition flex items-center gap-1 font-medium ${
                          c.service_status === "ENABLED"
                            ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-455"
                            : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-450"
                        }`}
                      >
                        <span className="material-icons text-[14px]">
                          {c.service_status === "ENABLED" ? "block" : "check_circle"}
                        </span>
                        {c.service_status === "ENABLED" ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-slate-950/40 border-t border-slate-800 px-4 py-3.5 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Showing Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong> ({total} citizens)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 rounded text-xs border border-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 rounded text-xs border border-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
