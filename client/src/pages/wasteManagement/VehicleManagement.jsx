import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/wasteManagement/PageHeader';
import AddVehicleModal from '../../components/wasteManagement/AddVehicleModal';
import LoadingSkeleton from '../../components/wasteManagement/LoadingSkeleton';

import { getWasteVehicles, deleteWasteVehicle, updateWasteVehicle } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    vehicle_type: ''
  });

  // Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize
      };
      if (searchQuery) params.search = searchQuery;
      if (filters.status) params.status = filters.status;
      if (filters.vehicle_type) params.vehicle_type = filters.vehicle_type;

      const res = await getWasteVehicles(params);
      setVehicles(res.data.items || []);
      setTotalItems(res.data.total || 0);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      toast.error('Failed to load waste collection vehicles.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [page, searchQuery, filters]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteWasteVehicle(id);
        toast.success('Vehicle deleted successfully');
        fetchVehicles();
      } catch (err) {
        toast.error('Failed to delete vehicle.');
      }
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'ACTIVE' || s === 'AVAILABLE' || s === 'READY') {
      return (
        <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '20px', backgroundColor: '#d1fae5', color: '#047857' }}>
          Active
        </span>
      );
    }
    if (s === 'IN_SERVICE' || s === 'ON ROUTE' || s === 'IN SERVICE') {
      return (
        <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '20px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
          In Service
        </span>
      );
    }
    if (s === 'MAINTENANCE' || s === 'IN MAINTENANCE') {
      return (
        <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '20px', backgroundColor: '#fef3c7', color: '#b45309' }}>
          Maintenance
        </span>
      );
    }
    return (
      <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '20px', backgroundColor: '#fee2e2', color: '#b91c1c' }}>
        Out of Service
      </span>
    );
  };

  // KPI Calculations
  const activeCount = vehicles.filter(v => {
    const s = (v.status || '').toUpperCase();
    return s === 'ACTIVE' || s === 'AVAILABLE' || s === 'READY';
  }).length;

  const inServiceCount = vehicles.filter(v => {
    const s = (v.status || '').toUpperCase();
    return s === 'IN_SERVICE' || s === 'ON ROUTE' || s === 'IN SERVICE';
  }).length;

  const maintCount = vehicles.filter(v => {
    const s = (v.status || '').toUpperCase();
    return s === 'MAINTENANCE' || s === 'IN MAINTENANCE';
  }).length;

  return (
    <div className="waste-vehicle-management-page">
      <PageHeader
        title="Waste Collection Fleet Management"
        subtitle="Manage compactor trucks, tipper trucks, electric carts, fuel types & driver assignments"
        onActionClick={() => setIsAddOpen(true)}
        actionLabel="Add New Vehicle"
      />

      {/* KPI Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f0fdf4', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">local_shipping</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Total Fleet</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>{totalItems}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Active / Ready</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#047857' }}>{activeCount}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">alt_route</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>In Route Service</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0284c7' }}>{inServiceCount}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">build</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>In Maintenance</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#d97706' }}>{maintCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', padding: '0.85rem 1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search vehicle #, driver, location..."
          className="waste-form-input"
          style={{ flexGrow: 1, maxWidth: '300px', fontSize: '0.85rem' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          className="waste-form-select"
          style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
          value={filters.vehicle_type}
          onChange={(e) => setFilters({ ...filters, vehicle_type: e.target.value })}
        >
          <option value="">All Vehicle Types</option>
          <option value="Compactor Truck">Compactor Truck</option>
          <option value="Tipper Truck">Tipper Truck</option>
          <option value="Dump Truck">Dump Truck</option>
          <option value="Electric Cart">Electric Cart</option>
        </select>

        <select
          className="waste-form-select"
          style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="IN_SERVICE">In Service</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="OUT_OF_SERVICE">Out of Service</option>
        </select>

        <button
          onClick={() => { setSearchQuery(''); setFilters({ status: '', vehicle_type: '' }); }}
          className="waste-btn waste-btn-secondary"
          style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
        >
          Reset
        </button>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '700' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Vehicle Reg #</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Vehicle Type</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Payload Capacity</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Assigned Driver</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Fuel Type</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Last GPS Location</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#047857' }}>
                      {v.vehicle_number}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: '#0f172a' }}>
                      {v.vehicle_type}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: '#334155' }}>
                      {v.capacity_tons} Tons
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {v.driver_name ? (
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px', color: '#10b981' }}>person</span>
                          {v.driver_name}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.15rem 0.5rem', backgroundColor: '#f1f5f9', borderRadius: '6px', color: '#334155' }}>
                        {v.fuel_type || 'Diesel'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#64748b' }}>
                      {v.current_location || 'Depot Base'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {getStatusBadge(v.status)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(v.id)}
                        title="Delete Vehicle"
                        style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddVehicleModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={fetchVehicles}
      />
    </div>
  );
}
