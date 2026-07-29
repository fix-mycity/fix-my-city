import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/wasteManagement/PageHeader';
import { ScheduleStatusBadge, AssignRouteWorkersModal } from '../../components/wasteManagement/ScheduleStatusBadge';
import { ScheduleStatusModal } from '../../components/wasteManagement/ScheduleStatusModal';
import LoadingSkeleton from '../../components/wasteManagement/LoadingSkeleton';

import { getWasteScheduleById, deleteWasteSchedule } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export default function RouteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const fetchRouteDetails = async () => {
    setLoading(true);
    try {
      const res = await getWasteScheduleById(id);
      setRoute(res.data);
    } catch (err) {
      toast.error('Failed to load route schedule details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRouteDetails();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete collection route ${route.route_name}?`)) {
      try {
        await deleteWasteSchedule(route.id);
        toast.success('Collection route schedule deleted successfully');
        navigate('/waste/schedules');
      } catch (err) {
        toast.error('Failed to delete route schedule.');
      }
    }
  };

  if (loading || !route) {
    return <LoadingSkeleton />;
  }

  // Progress percentage
  const totalBins = route.total_bins_count || 1;
  const collectedBins = route.collected_bins_count || 0;
  const progressPercent = Math.min(100, Math.round((collectedBins / totalBins) * 100));

  return (
    <div className="waste-route-details-page">
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => navigate('/waste/schedules')}
          className="waste-btn waste-btn-secondary"
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          Back to Routes & Schedules
        </button>
      </div>

      <PageHeader
        title={`Route: ${route.route_name}`}
        subtitle={`Schedule Code #${route.schedule_code} • ${route.ward || 'General Ward'} (${route.waste_type})`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Waypoints & Map Structure Card */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: '#0284c7', fontSize: '24px' }}>route</span>
                <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Route Waypoints & Navigation
                </h2>
              </div>
              <ScheduleStatusBadge status={route.status} />
            </div>

            {/* Waypoint Connection Diagram */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: '800', textTransform: 'uppercase' }}>START WAYPOINT</div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginTop: '0.2rem' }}>
                  📍 {route.start_point || 'Central Depot Base'}
                </div>
              </div>

              <div style={{ padding: '0 1rem', textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: '#64748b', fontSize: '28px' }}>arrow_forward</span>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0284c7' }}>
                  {route.distance_km || 12.5} km • {route.estimated_minutes || 45} mins
                </div>
              </div>

              <div style={{ flex: 1, textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: '800', textTransform: 'uppercase' }}>END DESTINATION</div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginTop: '0.2rem' }}>
                  🏁 {route.end_point || 'Waste Processing Landfill'}
                </div>
              </div>
            </div>

            {/* Map Canvas Visualizer Frame */}
            <div style={{ height: '220px', backgroundColor: '#f1f5f9', borderRadius: '10px', border: '1px border #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#475569' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '42px', color: '#0284c7' }}>map</span>
              <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Interactive Route GPS Map Canvas</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Waypoints linked from {route.start_point || 'Depot'} to {route.end_point || 'Landfill'}</div>
            </div>
          </div>

          {/* Collection Progress */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: '20px' }}>recycling</span>
              Collection Progress & Metrics
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: '700', textTransform: 'uppercase' }}>Collected Bins</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                  {route.collected_bins_count} / {route.total_bins_count} Bins
                </div>
              </div>

              <div style={{ backgroundColor: '#e0f2fe', padding: '1rem', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                <div style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: '700', textTransform: 'uppercase' }}>Collected Waste Tonnage</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                  {route.collected_weight_tons} Tons
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                <span>Route Completion Rate</span>
                <span>{progressPercent}%</span>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: progressPercent === 100 ? '#10b981' : '#0284c7', transition: 'width 0.3s ease' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Fleet & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Assigned Fleet & Driver */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#047857', fontSize: '20px' }}>local_shipping</span>
              Assigned Vehicle & Driver
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Vehicle Reg #:</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{route.vehicle_number || 'Unassigned'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Truck Driver:</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{route.driver_name || 'Unassigned'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Scheduled Date:</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{new Date(route.scheduled_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Assigned Workers Crew */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#6d28d9', fontSize: '20px' }}>group</span>
              Sanitation Workers Team
            </h3>

            {(!route.assigned_workers_list || route.assigned_workers_list.length === 0) ? (
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic' }}>
                No crew workers assigned yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {route.assigned_workers_list.map((w) => (
                  <div key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>{w.name}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6d28d9', backgroundColor: '#f5f3ff', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{w.role}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem 0' }}>
              Route Operations
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => setIsAssignOpen(true)}
                className="waste-btn waste-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group_add</span>
                Assign Vehicle & Workers
              </button>

              <button
                onClick={() => setIsStatusOpen(true)}
                className="waste-btn waste-btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>update</span>
                Update Route Status
              </button>

              <button
                onClick={handleDelete}
                className="waste-btn"
                style={{ width: '100%', justifyContent: 'center', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                Delete Route
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AssignRouteWorkersModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        schedule={route}
        onSuccess={fetchRouteDetails}
      />

      <ScheduleStatusModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        schedule={route}
        onSuccess={fetchRouteDetails}
      />
    </div>
  );
}
