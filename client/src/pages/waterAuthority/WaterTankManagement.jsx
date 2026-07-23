import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import TankCard from '../../components/waterAuthority/TankCard';
import TankTable from '../../components/waterAuthority/TankTable';
import TankFilter from '../../components/waterAuthority/TankFilter';
import TankSearch from '../../components/waterAuthority/TankSearch';
import LowLevelAlert from '../../components/waterAuthority/LowLevelAlert';
import UpdateWaterLevelModal from '../../components/waterAuthority/UpdateWaterLevelModal';
import WaterLevelChart from '../../components/waterAuthority/WaterLevelChart';

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
    maintenance_tanks: 0,
    today_refills: 0
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

      setTanks(response.data.items);
      setTotalItems(response.data.total_items);
      setTotalPages(response.data.total_pages);
    } catch (err) {
      toast.error("Failed to load water tanks.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await getTankDashboard();
      setDashboardStats(response.data);
    } catch (err) {
      console.error("Could not fetch dashboard statistics:", err);
    }
  };

  const fetchAllTanks = async () => {
    try {
      const response = await getTanks({ page: 1, page_size: 1000 });
      setAllTanksForAlerts(response.data.items);
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
    if (window.confirm("Are you sure you want to delete this water tank? All of its refill and maintenance records will be permanently removed.")) {
      try {
        await deleteTank(id);
        toast.success("Water tank deleted successfully.");
        fetchTanks();
      } catch (err) {
        toast.error("Failed to delete tank.");
      }
    }
  };

  const handleConfirmWaterLevelUpdate = async (tankId, newLevel) => {
    try {
      await updateWaterLevel(tankId, newLevel);
      toast.success("Water level updated successfully!");
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
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--water-text)' }}>
            Water Tank Management
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--water-text-muted)', marginTop: '0.2rem' }}>
            Monitor municipal water storage levels, manage tankers, reservoirs, and schedule cleanings.
          </p>
        </div>
        <button 
          onClick={() => navigate('/water/tanks/new')}
          className="water-btn"
          style={{ backgroundColor: 'var(--water-primary)', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}
        >
          <span className="material-symbols-outlined">add_circle</span>
          Register Water Tank
        </button>
      </div>

      {/* Critical Alarms Banners */}
      <LowLevelAlert tanks={allTanksForAlerts} />

      {/* Dashboard Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem'
      }}>
        <TankCard title="Total Tanks" value={dashboardStats.total_tanks} icon="propane_tank" color="var(--water-primary-light)" />
        <TankCard title="Active Tanks" value={dashboardStats.active_tanks} icon="check_circle" color="var(--water-success)" />
        <TankCard title="Low Level Tanks" value={dashboardStats.low_level_tanks} icon="warning" color="var(--water-warning)" />
        <TankCard title="Empty Tanks" value={dashboardStats.empty_tanks} icon="battery_0_bar" color="var(--water-danger)" />
        <TankCard title="Maintenance Ongoing" value={dashboardStats.maintenance_tanks} icon="engineering" color="#8e44ad" />
        <TankCard title="Today's Refills" value={dashboardStats.today_refills} icon="local_shipping" color="#16a085" />
      </div>

      {/* Grid: Charts Comparison and Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <WaterLevelChart tanks={allTanksForAlerts} />
      </div>

      {/* Search & Filter Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <TankSearch value={search} onSearch={(val) => { setSearch(val); setPage(1); }} />
        <TankFilter filters={filters} onChange={handleFilterChange} onClear={handleClearFilters} />
      </div>

      {/* Table Section */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '2.5rem', color: 'var(--water-primary-light)' }}>
            autorenew
          </span>
        </div>
      ) : (
        <>
          <TankTable 
            tanks={tanks}
            onView={(id) => navigate(`/water/tanks/${id}`)}
            onEdit={(id) => navigate(`/water/tanks/${id}/edit`)}
            onUpdateLevel={(tank) => { setSelectedTankForLevel(tank); setIsLevelModalOpen(true); }}
            onRefill={(id) => navigate(`/water/tanks/${id}/refill`)}
            onMaintenance={(id) => navigate(`/water/tanks/${id}/maintenance`)}
            onDelete={handleDelete}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)' }}>
                Showing page {page} of {totalPages} ({totalItems} items)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  className="water-btn"
                  style={{ opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                >
                  Previous
                </button>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  className="water-btn"
                  style={{ opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Quick Level Update Modal */}
      <UpdateWaterLevelModal 
        isOpen={isLevelModalOpen}
        onClose={() => { setIsLevelModalOpen(false); setSelectedTankForLevel(null); }}
        onConfirm={handleConfirmWaterLevelUpdate}
        tank={selectedTankForLevel}
      />
    </div>
  );
}
