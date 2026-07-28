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
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
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
        Export Report
        <span className="material-symbols-outlined" style={{ fontSize: '18px', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setIsOpen(false)} />
          <div style={{
            position: 'absolute',
            right: 0,
            marginTop: '0.4rem',
            width: '200px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            padding: '0.35rem 0',
            zIndex: 20
          }}>
            <button
              onClick={() => handleDownload("pdf")}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.5rem 1rem',
                fontSize: '0.82rem',
                fontWeight: '600',
                color: '#334155',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#dc2626' }}>picture_as_pdf</span>
              Export as PDF
            </button>

            <button
              onClick={() => handleDownload("excel")}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.5rem 1rem',
                fontSize: '0.82rem',
                fontWeight: '600',
                color: '#334155',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#16a34a' }}>table_chart</span>
              Export as Excel (.xls)
            </button>

            <button
              onClick={() => handleDownload("csv")}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.5rem 1rem',
                fontSize: '0.82rem',
                fontWeight: '600',
                color: '#334155',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563eb' }}>grid_on</span>
              Export as CSV
            </button>
          </div>
        </>
      )}
    </div>
  );
}
