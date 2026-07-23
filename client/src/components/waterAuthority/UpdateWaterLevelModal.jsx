import React, { useState } from 'react';

export default function UpdateWaterLevelModal({ isOpen, onClose, onConfirm, tank }) {
  if (!isOpen || !tank) return null;

  const [level, setLevel] = useState(tank.current_level_liters);

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(level);

    if (isNaN(val) || val < 0) {
      alert("Water level must be a non-negative number.");
      return;
    }
    if (val > tank.capacity_liters) {
      alert(`Water level cannot exceed the tank capacity of ${tank.capacity_liters} Liters.`);
      return;
    }

    onConfirm(tank.id, val);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <form onSubmit={handleSubmit} className="water-card" style={{
        width: '100%',
        maxWidth: '380px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--water-primary)', margin: 0 }}>
            Update Level: {tank.tank_number}
          </h3>
          <button 
            type="button" 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--water-text-muted)', display: 'flex', padding: 0 }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--water-text-muted)' }}>
          Maximum Tank Capacity: <strong>{tank.capacity_liters.toLocaleString()} Liters</strong>
        </div>

        <div>
          <label className="water-label">Current Water Level (Liters) *</label>
          <input 
            type="number" 
            step="1"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="water-input"
            required
            autoFocus
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button 
            type="button" 
            onClick={onClose}
            className="water-btn"
            style={{ borderColor: 'var(--water-border)', color: 'var(--water-text)' }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="water-btn"
            style={{ backgroundColor: 'var(--water-primary)', color: '#ffffff', border: 'none', fontWeight: '700' }}
          >
            Save Level
          </button>
        </div>
      </form>
    </div>
  );
}
