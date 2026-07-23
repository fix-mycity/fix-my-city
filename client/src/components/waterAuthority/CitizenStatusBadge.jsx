import React from "react";

export default function CitizenStatusBadge({ status }) {
  const isEnabled = status === "ENABLED";
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
      isEnabled ? "bg-emerald-500/20 text-emerald-450" : "bg-rose-500/20 text-rose-455"
    }`}>
      {status || "ENABLED"}
    </span>
  );
}
