import React from "react";
import { getCitizenExportUrl } from "../../services/citizenService";

export default function ExportCitizenButton() {
  const handleExport = () => {
    const url = getCitizenExportUrl();
    window.open(url, "_blank");
  };

  return (
    <button
      onClick={handleExport}
      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
    >
      <span className="material-icons text-sm">download</span>
      Export Citizens
    </button>
  );
}
