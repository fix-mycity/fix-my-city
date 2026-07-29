import React, { useState, useEffect } from 'react';
import { getWasteSchedules, assignWasteBinRoute } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export function AssignBinRouteModal({ isOpen, onClose, bin, onSuccess }) {
  const [schedules, setSchedules] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSchedules();
      if (bin?.assigned_route_id) {
        setSelectedRouteId(bin.assigned_route_id.toString());
      } else {
        setSelectedRouteId('');
      }
    }
  }, [isOpen, bin]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await getWasteSchedules();
      setSchedules(res.data.items || []);
    } catch (err) {
      toast.error('Failed to load collection routes');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !bin) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRouteId) {
      toast.error('Please select a collection route');
      return;
    }

    setSubmitting(true);
    try {
      await assignWasteBinRoute(bin.id, {
        assigned_route_id: parseInt(selectedRouteId)
      });
      toast.success(`Bin ${bin.bin_code} assigned to collection route!`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to assign collection route.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="waste-modal-overlay">
      <div className="waste-modal-container">
        <div className="waste-modal-header">
          <h3 className="waste-modal-title">Assign Bin to Collection Route</h3>
          <button onClick={onClose} className="waste-modal-close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="waste-modal-body">
            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                Bin #{bin.bin_code} - {bin.location}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                Ward: {bin.ward || 'General'} • Area: {bin.area || 'Citywide'}
              </div>
            </div>

            <div className="waste-form-group">
              <label className="waste-form-label">Select Collection Route Schedule *</label>
              {loading ? (
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Loading active routes...</div>
              ) : (
                <select
                  className="waste-form-select"
                  required
                  value={selectedRouteId}
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                >
                  <option value="">-- Choose Collection Route --</option>
                  {schedules.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.route_name} ({s.schedule_code} - {s.ward})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="waste-modal-footer">
            <button type="button" onClick={onClose} className="waste-btn waste-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="waste-btn waste-btn-primary">
              {submitting ? 'Assigning...' : 'Assign Route'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function BinQrModal({ isOpen, onClose, bin }) {
  if (!isOpen || !bin) return null;

  const qrDataStr = bin.qr_code_data || `SMART_BIN_${bin.bin_code}_${bin.ward || 'CITY'}`;
  // Generate SVG QR matrix simulation representation
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrDataStr)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="waste-modal-overlay">
      <div className="waste-modal-container" style={{ maxWidth: '420px', textAlign: 'center' }}>
        <div className="waste-modal-header">
          <h3 className="waste-modal-title">Smart Bin QR Code</h3>
          <button onClick={onClose} className="waste-modal-close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="waste-modal-body" style={{ alignItems: 'center', padding: '2rem 1.5rem' }}>
          <div style={{
            padding: '1rem',
            backgroundColor: '#ffffff',
            border: '2px solid #e2e8f0',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            display: 'inline-block'
          }}>
            <img
              src={qrSvgUrl}
              alt={`QR Code for Bin ${bin.bin_code}`}
              style={{ width: '180px', height: '180px', display: 'block' }}
            />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ margin: '0 0 0.2rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: '800' }}>
              Bin #{bin.bin_code}
            </h4>
            <div style={{ fontSize: '0.82rem', color: '#047857', fontWeight: '700' }}>
              {bin.waste_type} Bin • {bin.capacity_liters}L
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
              {bin.location} ({bin.ward || 'General'})
            </div>
          </div>
        </div>

        <div className="waste-modal-footer" style={{ justifyContent: 'center' }}>
          <button onClick={handlePrint} className="waste-btn waste-btn-primary">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>print</span>
            Print QR Tag
          </button>
          <button onClick={onClose} className="waste-btn waste-btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
