import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import TankTable from '../../components/waterAuthority/TankTable';
import TankFilter from '../../components/waterAuthority/TankFilter';
import TankSearch from '../../components/waterAuthority/TankSearch';
import LowLevelAlert from '../../components/waterAuthority/LowLevelAlert';
import UpdateWaterLevelModal from '../../components/waterAuthority/UpdateWaterLevelModal';

import { getTanks, deleteTank, updateWaterLevel, getTankDashboard } from '../../services/waterTankService';

export default function WaterTankManagement() {
  const navigate = useNavigate();

  // Data states
  const [tanks, setTanks] = useState([]);
  const [allTanksForAlerts, setAllTanksForAlerts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Stats
  const [dashboardStats, setDashboardStats] = useState({
    total_tanks: 0,
    active_tanks: 0,
    low_level_tanks: 0,
    empty_tanks: 0,
    maintenance_tanks: 0
  });

  // Level Modal states
  const [selectedTankForLevel, setSelectedTankForLevel] = useState(null);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    tank_type: null,
    status: null,
    ward: null,
    zone: null,
    water_source: null
  });

  const fetchTanks = async () => {
    setIsLoading(true);
    try {
      const response = await getTanks({
        page,
        page_size: 10,
        search: search || undefined,
        tank_type: filters.tank_type || undefined,
        status: filters.status || undefined,
        ward: filters.ward || undefined,
        zone: filters.zone || undefined,
        water_source: filters.water_source || undefined
      });

      setTanks(response.data?.items || []);
      setTotalItems(response.data?.total_items || 0);
      setTotalPages(response.data?.total_pages || 1);
    } catch (err) {
      toast.error("Failed to load water tanks.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await getTankDashboard();
      if (response.data) {
        setDashboardStats(response.data);
      }
    } catch (err) {
      console.error("Could not fetch tank statistics:", err);
    }
  };

  const fetchAllTanks = async () => {
    try {
      const response = await getTanks({ page: 1, page_size: 100 });
      const items = response.data?.items || [];
      setAllTanksForAlerts(items);

      // Fallback stats computation if dashboardStats returned zeros
      if (items.length > 0) {
        setDashboardStats(prev => ({
          total_tanks: response.data?.total_items || items.length,
          active_tanks: items.filter(t => t.status === 'ACTIVE').length,
          low_level_tanks: items.filter(t => t.status === 'LOW_LEVEL' || t.status === 'EMPTY').length,
          maintenance_tanks: items.filter(t => t.status === 'UNDER_MAINTENANCE').length
        }));
      }
    } catch (err) {
      console.error("Could not load alert data:", err);
    }
  };

  useEffect(() => {
    fetchTanks();
  }, [page, search, filters]);

  useEffect(() => {
    fetchDashboardStats();
    fetchAllTanks();
  }, [tanks]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      tank_type: null,
      status: null,
      ward: null,
      zone: null,
      water_source: null
    });
    setSearch('');
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this water tank?")) {
      try {
        await deleteTank(id);
        toast.success("Water tank deleted successfully.");
        fetchTanks();
      } catch (err) {
        toast.error("Failed to delete water tank.");
      }
    }
  };

  const handleOpenLevelModal = (tank) => {
    setSelectedTankForLevel(tank);
    setIsLevelModalOpen(true);
  };

  const handleSaveWaterLevel = async (tankId, newLevel) => {
    try {
      await updateWaterLevel(tankId, newLevel);
      toast.success("Water tank storage level updated!");
      setIsLevelModalOpen(false);
      fetchTanks();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update water level.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Water Tank Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
            Monitor municipal water storage levels, manage overhead reservoirs, and track refill schedules.
          </p>
        </div>

        <button 
          onClick={() => navigate('/water/tanks/new')}
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.6rem 1.25rem',
            fontWeight: '700',
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
          Register Water Tank
        </button>
      </div>

      {/* Critical Storage Alerts Banner */}
      <LowLevelAlert tanks={allTanksForAlerts} />

      {/* Clean Metrics Summary Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>propane_tank</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Storage Tanks</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{dashboardStats.total_tanks}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>check_circle</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Active & Operational</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#16a34a' }}>{dashboardStats.active_tanks}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>warning</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Low Level / Empty</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ea580c' }}>{(dashboardStats.low_level_tanks || 0) + (dashboardStats.empty_tanks || 0)}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>engineering</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Under Maintenance</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#dc2626' }}>{dashboardStats.maintenance_tanks}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <TankSearch value={search} onSearch={(val) => { setSearch(val); setPage(1); }} />
        <TankFilter filters={filters} onChange={handleFilterChange} onClear={handleClearFilters} />
      </div>

      {/* Table Section */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '2.5rem', color: '#2563eb' }}>
            autorenew
          </span>
        </div>
      ) : (
        <>
          <TankTable 
            tanks={tanks}
            onView={(id) => navigate(`/water/tanks/${id}`)}
            onEdit={(id) => navigate(`/water/tanks/${id}/edit`)}
            onUpdateLevel={handleOpenLevelModal}
            onRefill={(id) => navigate(`/water/tanks/${id}/refill`)}
            onMaintenance={(id) => navigate(`/water/tanks/${id}/maintenance`)}
            onDelete={handleDelete}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Page {page} of {totalPages} ({totalItems} water tanks registered)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    opacity: page === 1 ? 0.5 : 1
                  }}
                >
                  Previous
                </button>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    opacity: page === totalPages ? 0.5 : 1
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Water Level Update Modal */}
      {isLevelModalOpen && selectedTankForLevel && (
        <UpdateWaterLevelModal 
          tank={selectedTankForLevel}
          onClose={() => setIsLevelModalOpen(false)}
          onSave={handleSaveWaterLevel}
        />
      )}
    </div>
  );
}
