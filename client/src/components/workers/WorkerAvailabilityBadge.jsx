import React from 'react';

export default function WorkerAvailabilityBadge({ availability }) {
  const normalized = (availability || 'AVAILABLE').toUpperCase();

  const config = {
    AVAILABLE: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      icon: 'check_circle',
      label: 'Available',
    },
    BUSY: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      icon: 'construction',
      label: 'Busy on Job',
    },
    ON_LEAVE: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
      icon: 'bedtime',
      label: 'On Leave',
    },
  };

  const item = config[normalized] || config.ON_LEAVE;

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border inline-flex items-center gap-1.5 ${item.bg}`}>
      <span className={`w-2 h-2 rounded-full ${item.dot} animate-pulse`}></span>
      <span>{item.label}</span>
    </span>
  );
}
