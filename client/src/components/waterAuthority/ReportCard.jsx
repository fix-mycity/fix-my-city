import React from "react";

export default function ReportCard({ title, subtitle, actions, children }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:border-slate-700">
      <div className="px-6 py-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">{title}</h3>
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
