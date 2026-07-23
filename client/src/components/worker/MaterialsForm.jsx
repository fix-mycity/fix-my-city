import React, { useState, useEffect } from 'react';

const STANDARD_MATERIALS = [
  "PVC Pipe (2-inch)",
  "PVC Pipe (4-inch)",
  "Flange Valve (3-inch)",
  "Gasket Sealant Tape",
  "Coupling Joint",
  "Copper Pipe Fitting",
  "Water Filter Cartridge",
  "Sand & Cement Mix"
];

export default function MaterialsForm({ onMaterialsChange }) {
  const [selectedMaterials, setSelectedMaterials] = useState({});
  const [customText, setCustomText] = useState('');

  const handleCheckboxChange = (name) => {
    setSelectedMaterials((prev) => {
      const updated = { ...prev };
      if (updated[name]) {
        delete updated[name];
      } else {
        updated[name] = 1; // default quantity
      }
      return updated;
    });
  };

  const handleQuantityChange = (name, val) => {
    const qty = parseInt(val) || 1;
    setSelectedMaterials((prev) => ({
      ...prev,
      [name]: qty
    }));
  };

  // Compile materials description string on updates
  useEffect(() => {
    const items = Object.entries(selectedMaterials).map(
      ([name, qty]) => `${qty}x ${name}`
    );
    if (customText.trim()) {
      items.push(customText.trim());
    }
    onMaterialsChange(items.join(', '));
  }, [selectedMaterials, customText]);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid var(--water-border)',
      borderRadius: '12px',
      padding: '1.25rem',
      boxShadow: 'var(--water-shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem'
    }}>
      <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', color: 'var(--water-text)' }}>
        Materials & Parts Used Checklist
      </h5>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
        {STANDARD_MATERIALS.map((mat) => {
          const isChecked = !!selectedMaterials[mat];
          return (
            <div key={mat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.35rem 0.5rem', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCheckboxChange(mat)}
                />
                {mat}
              </label>
              {isChecked && (
                <input
                  type="number"
                  min="1"
                  value={selectedMaterials[mat]}
                  onChange={(e) => handleQuantityChange(mat, e.target.value)}
                  style={{
                    width: '45px',
                    padding: '0.15rem 0.25rem',
                    fontSize: '0.75rem',
                    borderRadius: '4px',
                    border: '1px solid var(--water-border)',
                    outline: 'none',
                    textAlign: 'center'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Custom notes input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--water-text)' }}>
          Other materials / Custom quantity descriptions
        </label>
        <input
          type="text"
          placeholder="e.g. 5x Bolt Screws, Pipe adhesive"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          style={{
            padding: '0.5rem',
            fontSize: '0.8rem',
            borderRadius: '6px',
            border: '1px solid var(--water-border)',
            outline: 'none'
          }}
        />
      </div>
    </div>
  );
}
