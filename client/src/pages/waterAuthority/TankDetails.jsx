import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import TankLevelIndicator from '../../components/waterAuthority/TankLevelIndicator';
import TankCapacityCard from '../../components/waterAuthority/TankCapacityCard';
import TankStatusBadge from '../../components/waterAuthority/TankStatusBadge';
import RefillHistoryTable from '../../components/waterAuthority/RefillHistoryTable';
import MaintenanceHistoryTable from '../../components/waterAuthority/MaintenanceHistoryTable';

import { getTankById } from '../../services/waterTankService';
import { getRefillHistory } from '../../services/tankRefillService';
import { getTankMaintenances } from '../../services/tankMaintenanceService';

export default function TankDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tank, setTank] = useState(null);
  const [refills, setRefills] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('refills'); // refills, maintenance, timeline

  const fetchAllDetails = async () => {
    setIsLoading(true);
    try {
      const tankResponse = await getTankById(id);
      setTank(tankResponse.data);
    } catch (err) {
      toast.error("Failed to load tank details.");
      navigate('/water/tanks');
      setIsLoading(false);
      return;
    }

    try {
      const refillsResponse = await getRefillHistory(id);
      setRefills(Array.isArray(refillsResponse.data) ? refillsResponse.data : []);
    } catch (_rErr) {
      setRefills([]);
    }

    try {
      const maintResponse = await getTankMaintenances(id);
      setMaintenances(Array.isArray(maintResponse.data) ? maintResponse.data : []);
    } catch (_mErr) {
      setMaintenances([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
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

  // Create timeline events list dynamically
  const getTimelineEvents = () => {
    const events = [];

    if (tank.installation_date) {
      events.push({
        type: 'INSTALLATION',
        title: 'Tank Installed',
        date: tank.installation_date,
        description: `Registered as ${tank.tank_type.replace(/_/g, ' ')} with capacity of ${tank.capacity_liters.toLocaleString()} Liters.`,
        icon: 'propane_tank',
        color: '#2980b9'
      });
    }

    refills.forEach(r => {
      events.push({
        type: 'REFILL',
        title: 'Tank Refilled',
        date: r.refill_date,
        description: `Refilled +${r.refilled_amount.toLocaleString()} Liters by operator ${r.operator_name || 'N/A'}. Level increased to ${r.current_level.toLocaleString()} Liters.`,
        icon: 'local_shipping',
        color: '#2ecc71'
      });
    });

    maintenances.forEach(m => {
      events.push({
        type: 'MAINTENANCE',
        title: `${m.maintenance_type} recorded`,
        date: m.start_date,
        description: `Reason: ${m.reason || 'N/A'}. Assigned worker: ${m.assigned_worker || 'None'}. Status: ${m.status}.`,
        icon: m.maintenance_type === 'CLEANING' ? 'cleaning_services' : 'build',
        color: m.status === 'COMPLETED' ? '#27ae60' : '#f39c12'
      });
    });

    // Sort events by date descending
    return events.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const timelineEvents = getTimelineEvents();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header and navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={() => navigate('/water/tanks')}
            className="water-btn-icon" 
            title="Back to list"
            style={{ border: '1px solid var(--water-border)', width: '36px', height: '36px', borderRadius: '8px' }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--water-text)', margin: 0 }}>
                {tank.tank_number}
              </h2>
              <TankStatusBadge status={tank.status} />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)' }}>
              {tank.tank_name || 'Unnamed tank'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => navigate(`/water/tanks/${tank.id}/edit`)}
            className="water-btn"
            style={{ borderColor: 'var(--water-border)', color: 'var(--water-text)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>edit</span>
            Modify
          </button>
          <button 
            onClick={() => navigate(`/water/tanks/${tank.id}/refill`)}
            className="water-btn"
            style={{ backgroundColor: 'var(--water-success)', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '700' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>local_shipping</span>
            Record Refill
          </button>
          <button 
            onClick={() => navigate(`/water/tanks/${tank.id}/maintenance`)}
            className="water-btn"
            style={{ backgroundColor: 'var(--water-warning)', color: '#2c3e50', border: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '700' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>build</span>
            Maintenance
          </button>
        </div>
      </div>

      {/* Grid: Liquid Level and Tech stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <TankLevelIndicator 
          currentLevel={tank.current_level_liters}
          capacity={tank.capacity_liters}
          minLevel={tank.minimum_level}
          status={tank.status}
        />
        <TankCapacityCard 
          capacity={tank.capacity_liters}
          minLevel={tank.minimum_level}
          maxLevel={tank.maximum_level}
          waterSource={tank.water_source}
          pipeline={tank.pipeline}
        />
      </div>

      {/* Location Details Sheet */}
      <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
          Location & Administrative Placement
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
          <div>
            <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Zone</span>
            <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{tank.zone || 'N/A'}</span>
          </div>
          <div>
            <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Ward</span>
            <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{tank.ward}</span>
          </div>
          <div>
            <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Area</span>
            <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{tank.area}</span>
          </div>
          <div>
            <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>GPS Coordinates</span>
            <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>
              {tank.latitude && tank.longitude ? `${tank.latitude}, ${tank.longitude}` : 'Not Specified'}
            </span>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Address</span>
            <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>{tank.address || 'N/A'}</span>
          </div>
        </div>

        {tank.remarks && (
          <div style={{ backgroundColor: 'var(--water-bg-light)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--water-text-muted)', borderLeft: '3px solid var(--water-primary-light)' }}>
            <strong>Remarks/Instructions: </strong>
            {tank.remarks}
          </div>
        )}
      </div>

      {/* Tabs Menu for history tables and timeline */}
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--water-border)', marginBottom: '1rem' }}>
          <button 
            onClick={() => setActiveTab('refills')}
            style={{
              padding: '0.5rem 1rem',
              fontWeight: '700',
              fontSize: '0.85rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'refills' ? '3px solid var(--water-primary-light)' : '3px solid transparent',
              color: activeTab === 'refills' ? 'var(--water-primary-light)' : 'var(--water-text-muted)',
              cursor: 'pointer'
            }}
          >
            Refills ({refills.length})
          </button>
          <button 
            onClick={() => setActiveTab('maintenance')}
            style={{
              padding: '0.5rem 1rem',
              fontWeight: '700',
              fontSize: '0.85rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'maintenance' ? '3px solid var(--water-primary-light)' : '3px solid transparent',
              color: activeTab === 'maintenance' ? 'var(--water-primary-light)' : 'var(--water-text-muted)',
              cursor: 'pointer'
            }}
          >
            Maintenance Log ({maintenances.length})
          </button>
          <button 
            onClick={() => setActiveTab('timeline')}
            style={{
              padding: '0.5rem 1rem',
              fontWeight: '700',
              fontSize: '0.85rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'timeline' ? '3px solid var(--water-primary-light)' : '3px solid transparent',
              color: activeTab === 'timeline' ? 'var(--water-primary-light)' : 'var(--water-text-muted)',
              cursor: 'pointer'
            }}
          >
            Operation Timeline ({timelineEvents.length})
          </button>
        </div>

        {/* Tab content rendering */}
        {activeTab === 'refills' && <RefillHistoryTable refills={refills} />}
        {activeTab === 'maintenance' && <MaintenanceHistoryTable maintenances={maintenances} />}
        {activeTab === 'timeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}>
            {timelineEvents.length === 0 ? (
              <span style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)' }}>No historical logs available.</span>
            ) : (
              timelineEvents.map((evt, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50px',
                      backgroundColor: `${evt.color}15`,
                      color: evt.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>{evt.icon}</span>
                    </div>
                    {idx < timelineEvents.length - 1 && (
                      <div style={{ width: '2px', flex: 1, backgroundColor: 'var(--water-border)', margin: '4px 0' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--water-text)' }}>{evt.title}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--water-text-muted)', fontWeight: '700' }}>{evt.date}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--water-text-muted)', margin: '0.2rem 0 0 0' }}>
                      {evt.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

    </div>
  );
}
