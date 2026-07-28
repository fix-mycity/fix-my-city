import React from 'react';

export function formatTimeAgo(timestamp) {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return null;

  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function WorkerAvailabilityBadge({ availability, statusUpdatedAt }) {
  const normalized = (availability || 'AVAILABLE').toUpperCase();
  const timeAgo = formatTimeAgo(statusUpdatedAt);

  const config = {
    AVAILABLE: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      icon: 'check_circle',
      label: 'Available',
    },
    ON_BREAK: {
      bg: 'bg-amber-50 text-amber-800 border-amber-300',
      dot: 'bg-amber-500',
      icon: 'coffee',
      label: 'On Break',
    },
    BUSY: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
      icon: 'construction',
      label: 'Busy on Job',
    },
    ON_LEAVE: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
      icon: 'bedtime',
      label: 'On Leave',
    },
    UNAVAILABLE: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
      icon: 'do_not_disturb',
      label: 'Unavailable',
    }
  };

  const item = config[normalized] || config.UNAVAILABLE;

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border inline-flex items-center gap-1.5 shadow-2xs ${item.bg}`}>
      <span className={`w-2 h-2 rounded-full ${item.dot} animate-pulse`}></span>
      <span>{item.label}</span>
      {timeAgo && <span className="opacity-75 text-[10px] font-normal">({timeAgo})</span>}
    </span>
  );
}
