import React from "react";

const NotificationPriorityBadge = ({ priority }) => {
  const styles = {
    LOW: "bg-blue-950/40 text-blue-400 border-blue-900/60",
    MEDIUM: "bg-indigo-950/40 text-indigo-400 border-indigo-900/60",
    HIGH: "bg-orange-950/40 text-orange-400 border-orange-900/60",
    CRITICAL: "bg-rose-950/40 text-rose-400 border-rose-900/60 animate-bounce"
  };

  const styleClass = styles[priority?.toUpperCase()] || "bg-slate-800 text-slate-300 border-slate-700";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styleClass}`}>
      {priority}
    </span>
  );
};

export default NotificationPriorityBadge;
