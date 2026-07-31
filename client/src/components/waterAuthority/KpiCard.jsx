import React from "react";

export default function KpiCard({ title, value, icon, description, trend, trendType, color = "blue" }) {
  const getColors = () => {
    switch (color) {
      case "emerald":
      case "green":
        return {
          iconBg: "#f0fdf4",
          iconColor: "#16a34a",
          border: "#bbf7d0"
        };
      case "rose":
      case "red":
        return {
          iconBg: "#fef2f2",
          iconColor: "#dc2626",
          border: "#fecaca"
        };
      case "amber":
      case "orange":
        return {
          iconBg: "#fff7ed",
          iconColor: "#ea580c",
          border: "#fed7aa"
        };
      case "violet":
      case "purple":
        return {
          iconBg: "#f3e8ff",
          iconColor: "#7c3aed",
          border: "#ddd6fe"
        };
      case "blue":
      default:
        return {
          iconBg: "#eff6ff",
          iconColor: "#2563eb",
          border: "#bfdbfe"
        };
    }
  };

  const colors = getColors();

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      justify: 'space-between',
      gap: '1rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', tracking: '0.5px' }}>
            {title}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', marginTop: '0.3rem' }}>
            {value}
          </div>
        </div>

        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          backgroundColor: colors.iconBg,
          color: colors.iconColor,
          display: 'flex',
          alignItems: 'center',
          justify: 'center'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
            {icon}
          </span>
        </div>
      </div>
      
      {(description || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.6rem', marginTop: '0.2rem' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '70%' }}>
            {description}
          </span>
          {trend && (
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              color: trendType === "up" ? "#16a34a" : trendType === "down" ? "#dc2626" : "#ea580c"
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                {trendType === "up" ? "arrow_upward" : trendType === "down" ? "arrow_downward" : "swap_horiz"}
              </span>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
