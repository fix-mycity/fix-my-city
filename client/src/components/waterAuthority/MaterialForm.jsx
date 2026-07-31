import React, { useState } from 'react';

export default function MaterialForm({ isOpen, onClose, onSubmit }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    material_name: '',
    quantity: '',
    unit: 'pcs',
    cost: '',
    supplier: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!formData.material_name.trim() || !formData.quantity || !formData.cost) {
      alert("Material Name, Quantity, and Unit Cost are required.");
      return;
    }

    const qty = parseFloat(formData.quantity);
    const price = parseFloat(formData.cost);
    if (isNaN(qty) || qty <= 0) {
      alert("Quantity must be a positive number.");
      return;
    }
    if (isNaN(price) || price < 0) {
      alert("Cost cannot be negative.");
      return;
    }

    onSubmit({
      material_name: formData.material_name,
      quantity: qty,
      unit: formData.unit,
      cost: price,
      supplier: formData.supplier || null
    });
    
    // reset
    setFormData({ material_name: '', quantity: '', unit: 'pcs', cost: '', supplier: '' });
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
      <form onSubmit={handleFormSubmit} className="water-card" style={{
        width: '100%',
        maxWidth: '380px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--water-primary)', margin: 0 }}>
            Record Material Usage
          </h3>
          <button 
            type="button" 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--water-text-muted)', display: 'flex', padding: 0 }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div>
          <label className="water-label">Material Name *</label>
          <input 
            type="text" 
            name="material_name"
            value={formData.material_name}
            onChange={handleChange}
            placeholder="e.g. PVC Valve Adapter 2-inch"
            required
            className="water-input"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="water-label">Quantity *</label>
            <input 
              type="number" 
              step="0.01"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="e.g. 5"
              required
              className="water-input"
            />
          </div>
          <div>
            <label className="water-label">Unit *</label>
            <input 
              type="text" 
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="e.g. pcs, meters, bags"
              required
              className="water-input"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="water-label">Unit Cost ($) *</label>
            <input 
              type="number" 
              step="0.01"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              placeholder="Unit price"
              required
              className="water-input"
            />
          </div>
          <div>
            <label className="water-label">Supplier / Vendor</label>
            <input 
              type="text" 
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              placeholder="e.g. Apex Piping"
              className="water-input"
            />
          </div>
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
            Add Material
          </button>
        </div>
      </form>
    </div>
  );
}
