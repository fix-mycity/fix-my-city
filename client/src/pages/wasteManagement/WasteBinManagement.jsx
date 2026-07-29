import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/wasteManagement/PageHeader';
import { BinFilter, BinSearch } from '../../components/wasteManagement/BinFilter';
import { BinTable } from '../../components/wasteManagement/BinTable';
import { UpdateFillLevelModal } from '../../components/wasteManagement/UpdateFillLevelModal';
import { AssignBinRouteModal, BinQrModal } from '../../components/wasteManagement/AssignBinRouteModal';
import AddBinModal from '../../components/wasteManagement/AddBinModal';
import LoadingSkeleton from '../../components/wasteManagement/LoadingSkeleton';

import { getWasteBins, deleteWasteBin } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export default function WasteBinManagement() {
  const navigate = useNavigate();

  // State
  const [bins, setBins] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    waste_type: '',
    status: '',
    ward: '',
    area: ''
  });

  // Modals
  const [selectedBin, setSelectedBin] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isFillModalOpen, setIsFillModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const fetchBins = async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize
      };

      if (searchQuery) params.search = searchQuery;
      if (filters.waste_type) params.waste_type = filters.waste_type;
      if (filters.status) params.status = filters.status;
      if (filters.ward) params.ward = filters.ward;
      if (filters.area) params.area = filters.area;

      const res = await getWasteBins(params);
      setBins(res.data.items || []);
      setTotalItems(res.data.total || 0);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      toast.error('Failed to load smart waste bins.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBins();
  }, [page, searchQuery, filters]);

  const handleResetFilters = () => {
    setFilters({
      waste_type: '',
      status: '',
      ward: '',
      area: ''
    });
    setSearchQuery('');
    setPage(1);
  };

  const handleOpenFillLevel = (bin) => {
    setSelectedBin(bin);
    setIsFillModalOpen(true);
  };

  const handleOpenAssignRoute = (bin) => {
    setSelectedBin(bin);
    setIsRouteModalOpen(true);
  };

  const handleShowQr = (bin) => {
    setSelectedBin(bin);
    setIsQrModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this smart waste bin?')) {
      try {
        await deleteWasteBin(id);
        toast.success('Smart Waste Bin deleted successfully');
        fetchBins();
      } catch (err) {
        toast.error('Failed to delete waste bin.');
      }
    }
  };

  // Header summary statistics
  const totalBinsCount = totalItems;
  const overflowCount = bins.filter(b => b.status === 'Overflow').length;
  const fullCount = bins.filter(b => b.status === 'Full').length;
  const maintenanceCount = bins.filter(b => b.status === 'Maintenance' || b.status === 'Damaged').length;

  return (
    <div className="waste-bin-management-page">
      <PageHeader
        title="Smart Waste Bin Management"
        subtitle="Real-time fill level telemetry, IoT sensors, QR codes & collection routes"
        onActionClick={() => setIsAddOpen(true)}
        actionLabel="Add Smart Bin"
      />

      {/* Summary KPI Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f0fdf4', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">delete</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Total Bins</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>{totalBinsCount}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">warning</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Overflowing</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#dc2626' }}>{overflowCount}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">running_with_errors</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Full (80%+)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#d97706' }}>{fullCount}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">build</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Maintenance</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#475569' }}>{maintenanceCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <BinFilter
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
      />

      <BinSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Data Table */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <BinTable
          bins={bins}
          totalItems={totalItems}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
          onUpdateFillLevel={handleOpenFillLevel}
          onAssignRoute={handleOpenAssignRoute}
          onShowQr={handleShowQr}
          onDeleteBin={handleDelete}
        />
      )}

      {/* Modals */}
      <AddBinModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={fetchBins}
      />

      <UpdateFillLevelModal
        isOpen={isFillModalOpen}
        onClose={() => setIsFillModalOpen(false)}
        bin={selectedBin}
        onSuccess={fetchBins}
      />

      <AssignBinRouteModal
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
        bin={selectedBin}
        onSuccess={fetchBins}
      />

      <BinQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        bin={selectedBin}
      />
    </div>
  );
}
