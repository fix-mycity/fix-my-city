import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/wasteManagement/PageHeader';
import { VehicleStatusBadge, VehicleTypeBadge } from '../../components/wasteManagement/VehicleStatusBadge';
import { AssignVehicleDriverModal, UpdateVehicleStatusModal } from '../../components/wasteManagement/AssignVehicleDriverModal';
import LoadingSkeleton from '../../components/wasteManagement/LoadingSkeleton';

import { getWasteVehicleById, deleteWasteVehicle } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const fetchVehicleDetails = async () => {
    setLoading(true);
    try {
      const res = await getWasteVehicleById(id);
      setVehicle(res.data);
    } catch (err) {
      toast.error('Failed to load vehicle details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleDetails();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete vehicle ${vehicle.vehicle_number}?`)) {
      try {
        await deleteWasteVehicle(vehicle.id);
        toast.success('Vehicle deleted successfully');
        navigate('/waste/vehicles');
      } catch (err) {
        toast.error('Failed to delete vehicle.');
      }
    }
  };

  if (loading || !vehicle) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="waste-vehicle-details-page">
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => navigate('/waste/vehicles')}
          className="waste-btn waste-btn-secondary"
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          Back to Vehicles Fleet
        </button>
      </div>

      <PageHeader
        title={`Vehicle Reg #${vehicle.vehicle_number}`}
        subtitle={`${vehicle.vehicle_type} • Registered Fleet Component`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Info Card */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <VehicleTypeBadge type={vehicle.vehicle_type} />
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  {vehicle.vehicle_number}
                </h2>
              </div>
              <VehicleStatusBadge status={vehicle.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Payload Capacity</div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>{vehicle.capacity_tons} Tons</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Fuel Type</div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>{vehicle.fuel_type || 'Diesel'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Last Maintenance Serviced</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#047857' }}>
                  {vehicle.last_serviced_at ? new Date(vehicle.last_serviced_at).toLocaleDateString() : 'Up to Date'}
                </div>
              </div>
            </div>
          </div>

          {/* Assignments Card */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: '20px' }}>badge</span>
              Driver & Route Assignments
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: '700', textTransform: 'uppercase' }}>Assigned Driver</div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
                  {vehicle.driver_name || 'Unassigned'}
                </div>
              </div>

              <div style={{ backgroundColor: '#f5f3ff', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd6fe' }}>
                <div style={{ fontSize: '0.75rem', color: '#6d28d9', fontWeight: '700', textTransform: 'uppercase' }}>Assigned Collection Route</div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginTop: '0.2rem' }}>
                  {vehicle.assigned_route_name || 'Unassigned'}
                </div>
              </div>
            </div>
          </div>

          {/* GPS Telemetry Location */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#06b6d4', fontSize: '20px' }}>location_on</span>
              GPS Live Location Telemetry
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Current Sector / Location</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>{vehicle.current_location || 'Central Depot'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Coordinates (Lat, Long)</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>
                  {vehicle.latitude || 28.6139}, {vehicle.longitude || 77.2090}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem 0' }}>
              Fleet Operations
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => setIsAssignOpen(true)}
                className="waste-btn waste-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                Assign Driver & Route
              </button>

              <button
                onClick={() => setIsStatusOpen(true)}
                className="waste-btn waste-btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>build</span>
                Update Fleet Status
              </button>

              <button
                onClick={handleDelete}
                className="waste-btn"
                style={{ width: '100%', justifyContent: 'center', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                Delete Vehicle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AssignVehicleDriverModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        vehicle={vehicle}
        onSuccess={fetchVehicleDetails}
      />

      <UpdateVehicleStatusModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        vehicle={vehicle}
        onSuccess={fetchVehicleDetails}
      />
    </div>
  );
}
