import React from "react";

const NotificationStatusBadge = ({ status }) => {
  const styles = {
    DRAFT: "bg-slate-800 text-slate-300 border-slate-700",
    SCHEDULED: "bg-amber-950 text-amber-300 border-amber-800",
    SENDING: "bg-sky-950 text-sky-300 border-sky-800 animate-pulse",
    SENT: "bg-emerald-950 text-emerald-300 border-emerald-800",
    FAILED: "bg-rose-950 text-rose-300 border-rose-800",
    ARCHIVED: "bg-gray-800 text-gray-400 border-gray-700"
  };

  const styleClass = styles[status?.toUpperCase()] || "bg-slate-800 text-slate-300 border-slate-700";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${styleClass}`}>
      {status}
    </span>
  );
};

export default NotificationStatusBadge;
