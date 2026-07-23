import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import RefillHistoryTable from '../../components/waterAuthority/RefillHistoryTable';
import WaterLevelChart from '../../components/waterAuthority/WaterLevelChart';
import { getTankById } from '../../services/waterTankService';
import { getRefillHistory, recordTankRefill } from '../../services/tankRefillService';

export default function TankRefillHistoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tank, setTank] = useState(null);
  const [refills, setRefills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    refill_date: new Date().toISOString().substring(0, 10),
    refilled_amount: '',
    operator_name: '',
    remarks: ''
  });

  const fetchTankAndRefills = async () => {
    setIsLoading(true);
    try {
      const tankResponse = await getTankById(id);
      setTank(tankResponse.data);

      const refillsResponse = await getRefillHistory(id);
      setRefills(refillsResponse.data);
    } catch (err) {
      toast.error("Could not fetch tank/refills details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTankAndRefills();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(formData.refilled_amount);

    if (isNaN(amount) || amount <= 0) {
      alert("Refilled amount must be a positive number.");
      return;
    }

    try {
      await recordTankRefill(id, {
        refill_date: formData.refill_date,
        refilled_amount: amount,
        operator_name: formData.operator_name || null,
        remarks: formData.remarks || null
      });

      toast.success("Tank refill recorded successfully!");
      setFormData({
        refill_date: new Date().toISOString().substring(0, 10),
        refilled_amount: '',
        operator_name: '',
        remarks: ''
      });
      fetchTankAndRefills();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to record refill.");
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '2.5rem', color: 'var(--water-primary-light)' }}>
          autorenew
        </span>
      </div>
    );
  }

  if (!tank) {
    return (
      <div className="water-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3>Water tank not found</h3>
        <button onClick={() => navigate('/water/tanks')} className="water-btn" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button 
          onClick={() => navigate(`/water/tanks/${id}`)}
          className="water-btn-icon" 
          title="Back to Details"
          style={{ border: '1px solid var(--water-border)', width: '36px', height: '36px', borderRadius: '8px' }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--water-text)', margin: 0 }}>
            Tank Refill Manager: {tank.tank_number}
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)' }}>
            Current Level: <strong>{tank.current_level_liters.toLocaleString()} L</strong> / {tank.capacity_liters.toLocaleString()} L
          </span>
        </div>
      </div>

      {/* Grid: Form and charts comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Record refill form */}
        <form onSubmit={handleSubmit} className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
            Record Tanker Refill Operation
          </h3>

          <div>
            <label className="water-label">Refill Date *</label>
            <input 
              type="date"
              name="refill_date"
              value={formData.refill_date}
              onChange={handleChange}
              className="water-input"
              required
            />
          </div>

          <div>
            <label className="water-label">Refilled Volume (Liters) *</label>
            <input 
              type="number"
              name="refilled_amount"
              value={formData.refilled_amount}
              onChange={handleChange}
              placeholder="e.g. 10000"
              className="water-input"
              required
            />
          </div>

          <div>
            <label className="water-label">Operator / Driver Name</label>
            <input 
              type="text"
              name="operator_name"
              value={formData.operator_name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Remarks</label>
            <input 
              type="text"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="e.g. Completed via Tanker Truck #3"
              className="water-input"
            />
          </div>

          <button 
            type="submit" 
            className="water-btn"
            style={{ backgroundColor: 'var(--water-success)', color: '#ffffff', border: 'none', fontWeight: '700', marginTop: '0.5rem' }}
          >
            Dispatch & Save Refill
          </button>
        </form>

        <WaterLevelChart refills={refills} />
      </div>

      {/* Refills Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', margin: 0, letterSpacing: '0.5px' }}>
          Refills Logging History
        </h4>
        <RefillHistoryTable refills={refills} />
      </div>

    </div>
  );
}
