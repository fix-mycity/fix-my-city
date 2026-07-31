import React from "react";

export default function DateRangePicker({ start, end, onChange }) {
  const applyPreset = (preset) => {
    const today = new Date();
    let startDate = "";
    const endDate = today.toISOString().split("T")[0];

    if (preset === "today") {
      startDate = endDate;
    } else if (preset === "week") {
      const prevWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate = prevWeek.toISOString().split("T")[0];
    } else if (preset === "month") {
      const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate() + 1);
      startDate = prevMonth.toISOString().split("T")[0];
    } else if (preset === "year") {
      startDate = `${today.getFullYear()}-01-01`;
    }

    onChange({ start_date: startDate, end_date: endDate });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 bg-slate-950 border border-slate-800 p-2 rounded-lg">
      <span className="text-xs text-slate-400 font-medium px-2">Presets:</span>
      <button
        onClick={() => applyPreset("today")}
        className="px-2.5 py-1 text-xs rounded hover:bg-slate-800 text-slate-300 font-medium border border-transparent hover:border-slate-700"
      >
        Today
      </button>
      <button
        onClick={() => applyPreset("week")}
        className="px-2.5 py-1 text-xs rounded hover:bg-slate-800 text-slate-300 font-medium border border-transparent hover:border-slate-700"
      >
        7 Days
      </button>
      <button
        onClick={() => applyPreset("month")}
        className="px-2.5 py-1 text-xs rounded hover:bg-slate-800 text-slate-300 font-medium border border-transparent hover:border-slate-700"
      >
        30 Days
      </button>
      <button
        onClick={() => applyPreset("year")}
        className="px-2.5 py-1 text-xs rounded hover:bg-slate-800 text-slate-300 font-medium border border-transparent hover:border-slate-700"
      >
        YTD
      </button>
    </div>
  );
}
