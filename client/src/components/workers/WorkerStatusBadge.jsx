import React from 'react';

export default function WorkerStatusBadge({ status }) {
  const normalized = (status || 'ACTIVE').toUpperCase();

  const styles = {
    ACTIVE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    INACTIVE: 'bg-slate-100 text-slate-700 border-slate-200',
    SUSPENDED: 'bg-red-100 text-red-800 border-red-200',
    BLOCKED: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  const label = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    SUSPENDED: 'Suspended',
    BLOCKED: 'Blocked',
  };

  const currentStyle = styles[normalized] || styles.INACTIVE;
  const currentLabel = label[normalized] || normalized;

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border inline-flex items-center gap-1 ${currentStyle}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {currentLabel}
    </span>
  );
}
