import React from "react";

export default function CitizenSearch({ value, onChange }) {
  return (
    <div style={{ position: 'relative', flex: '1 1 300px' }}>
      <span className="material-symbols-outlined" style={{
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '18px',
        color: '#64748b',
        pointerEvents: 'none'
      }}>
        search
      </span>
      <input
        type="text"
        placeholder="Search citizen by Name, Email or Phone..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="water-input"
        style={{
          paddingLeft: '38px',
          height: '40px',
          fontSize: '0.85rem'
        }}
      />
    </div>
  );
}
