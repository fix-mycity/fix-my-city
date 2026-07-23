import React from "react";

export default function KpiCard({ title, value, icon, description, trend, trendType, color = "blue" }) {
  const getColors = () => {
    switch (color) {
      case "emerald":
      case "green":
        return {
          bg: "from-emerald-500/10 to-teal-500/5",
          border: "hover:border-emerald-500/30",
          iconBg: "bg-emerald-500/20 text-emerald-400",
          text: "text-emerald-400"
        };
      case "rose":
      case "red":
        return {
          bg: "from-rose-500/10 to-pink-500/5",
          border: "hover:border-rose-500/30",
          iconBg: "bg-rose-500/20 text-rose-400",
          text: "text-rose-400"
        };
      case "amber":
      case "orange":
        return {
          bg: "from-amber-500/10 to-yellow-500/5",
          border: "hover:border-amber-500/30",
          iconBg: "bg-amber-500/20 text-amber-400",
          text: "text-amber-400"
        };
      case "violet":
      case "purple":
        return {
          bg: "from-violet-500/10 to-indigo-500/5",
          border: "hover:border-violet-500/30",
          iconBg: "bg-violet-500/20 text-violet-400",
          text: "text-violet-400"
        };
      case "blue":
      default:
        return {
          bg: "from-blue-500/10 to-indigo-500/5",
          border: "hover:border-blue-500/30",
          iconBg: "bg-blue-500/20 text-blue-400",
          text: "text-blue-400"
        };
    }
  };

  const colors = getColors();

  return (
    <div className={`relative bg-gradient-to-br ${colors.bg} bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md transition-all duration-300 hover:-translate-y-1 ${colors.border}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
          <h2 className="text-2xl font-bold text-white tracking-tight">{value}</h2>
        </div>
        <div className={`p-2.5 rounded-lg ${colors.iconBg}`}>
          <span className="material-icons text-xl">{icon}</span>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-400 truncate max-w-[70%]">{description}</span>
        {trend && (
          <span className={`text-xs font-semibold flex items-center gap-1 ${
            trendType === "up" ? "text-emerald-450" : trendType === "down" ? "text-rose-450" : "text-amber-450"
          }`}>
            <span className="material-icons text-[12px]">
              {trendType === "up" ? "arrow_upward" : trendType === "down" ? "arrow_downward" : "swap_horiz"}
            </span>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
