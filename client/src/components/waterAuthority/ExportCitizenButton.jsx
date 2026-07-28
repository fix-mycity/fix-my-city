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
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        color: '#0f172a',
        padding: '0.55rem 1rem',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '0.85rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563eb' }}>download</span>
      Export Citizens List
    </button>
  );
}
