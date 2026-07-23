import React, { useState } from "react";
import { getExportUrl } from "../../services/analyticsService";

export default function ExportButton({ reportType, filters = {} }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = (format) => {
    const url = getExportUrl(reportType, format, filters);
    window.open(url, "_blank");
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
      >
        <span className="material-icons text-sm">download</span>
        Export Report
        <span className="material-icons text-[16px] transition-transform duration-200" style={{ transform: isOpen ? "rotate(180deg)" : "none" }}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-20 animate-fade-in">
            <button
              onClick={() => handleDownload("pdf")}
              className="w-full text-left px-4 py-2 text-sm text-slate-350 hover:bg-slate-800 hover:text-white transition flex items-center gap-2"
            >
              <span className="material-icons text-red-400 text-sm">picture_as_pdf</span>
              Export as PDF
            </button>
            <button
              onClick={() => handleDownload("excel")}
              className="w-full text-left px-4 py-2 text-sm text-slate-350 hover:bg-slate-800 hover:text-white transition flex items-center gap-2"
            >
              <span className="material-icons text-emerald-400 text-sm">description</span>
              Export as Excel (.xls)
            </button>
            <button
              onClick={() => handleDownload("csv")}
              className="w-full text-left px-4 py-2 text-sm text-slate-350 hover:bg-slate-800 hover:text-white transition flex items-center gap-2"
            >
              <span className="material-icons text-blue-400 text-sm">grid_on</span>
              Export as CSV
            </button>
          </div>
        </>
      )}
    </div>
  );
}
