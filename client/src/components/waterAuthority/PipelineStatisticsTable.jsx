import React from "react";

export default function PipelineStatisticsTable({ conditions = {}, materials = {} }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Pipeline Conditions</h4>
        <div className="space-y-2">
          {Object.keys(conditions).length === 0 ? (
            <p className="text-sm text-slate-500 py-2">No records</p>
          ) : (
            Object.keys(conditions).map((c, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-slate-800/40">
                <span className="text-slate-350">{c}</span>
                <span className="font-semibold text-white">{conditions[c]} pipelines</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Material Distribution</h4>
        <div className="space-y-2">
          {Object.keys(materials).length === 0 ? (
            <p className="text-sm text-slate-500 py-2">No records</p>
          ) : (
            Object.keys(materials).map((m, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-slate-800/40">
                <span className="text-slate-350">{m}</span>
                <span className="font-semibold text-white">{materials[m]} pipelines</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
