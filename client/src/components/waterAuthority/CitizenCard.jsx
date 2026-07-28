import React from "react";

export default function CitizenCard({ title, value, icon, color = "blue", description }) {
  const getColors = () => {
    switch (color) {
      case "emerald":
      case "green":
        return { bg: "#f0fdf4", text: "#16a34a" };
      case "rose":
      case "red":
        return { bg: "#fef2f2", text: "#dc2626" };
      case "amber":
      case "orange":
        return { bg: "#fff7ed", text: "#ea580c" };
      case "blue":
      default:
        return { bg: "#eff6ff", text: "#2563eb" };
    }
  };

  const c = getColors();

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      justify: 'space-between',
      gap: '1rem',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
    }}>
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
          {value}
        </div>
        {description && (
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
            {description}
          </div>
        )}
      </div>

      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '10px',
        backgroundColor: c.bg,
        color: c.text,
        display: 'flex',
        alignItems: 'center',
        justify: 'center'
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
          {icon}
        </span>
      </div>
    </div>
  );
}
