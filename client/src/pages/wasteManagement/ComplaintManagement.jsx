import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { ComplaintTable } from '../../components/wasteManagement/ComplaintTable';
import { ComplaintFilter, ComplaintSearch } from '../../components/wasteManagement/ComplaintFilter';
import PageHeader from '../../components/wasteManagement/PageHeader';
import LoadingSkeleton from '../../components/wasteManagement/LoadingSkeleton';
import AssignWorkerModal from '../../components/wasteManagement/AssignWorkerModal';
import StatusUpdateModal from '../../components/wasteManagement/StatusUpdateModal';
import AddComplaintModal from '../../components/wasteManagement/AddComplaintModal';
import { toastConfirm } from '../../utils/toastConfirm';

import { 
  getWasteComplaints, 
  updateWasteComplaintStatus, 
  assignWasteComplaintWorker, 
  getWasteComplaintsDashboardSummary,
  deleteWasteComplaint
} from '../../services/wasteManagementService';

export default function ComplaintManagement() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Complaints and Pagination
  const [complaints, setComplaints] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filter, Search, and Sort state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    ward: '',
    area: ''
  });
  const [sortBy, setSortBy] = useState('newest');

  // Stats Summary
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    active: 0,
    completed: 0
  });

  // Modal control states
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchSummary = async () => {
    try {
      const response = await getWasteComplaintsDashboardSummary();
      const data = response.data || {};
      const statuses = data.statuses || {};
      const total = data.total_complaints || data.total || 0;
      const closed = (statuses.CLOSED || 0) + (statuses.RESOLVED || 0) + (statuses.COMPLETED || 0) + (statuses.VERIFIED || 0);
      const pending = (statuses.NEW || 0) + (statuses.PENDING || 0);
      const active = (statuses.ASSIGNED || 0) + (statuses.WORKER_ASSIGNED || 0) + (statuses.IN_PROGRESS || 0) + (statuses.ACCEPTED || 0);

      setStats({
        total: total,
        new: pending,
        active: active,
        completed: closed
      });
    } catch (err) {
      console.error("Error loading waste dashboard summary stats", err);
    }
  };

  const fetchComplaintsData = async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
        sort_by: sortBy
      };

      if (searchQuery) params.search = searchQuery;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.category) params.category = filters.category;
      if (filters.ward) params.ward = filters.ward;
      if (filters.area) params.area = filters.area;

      const response = await getWasteComplaints(params);
      setComplaints(response.data.items || []);
      setTotalItems(response.data.total || response.data.total_items || 0);
      setTotalPages(response.data.total_pages || 1);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not retrieve waste complaints data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchComplaintsData();
  }, [page, filters, searchQuery, sortBy]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      status: '',
      priority: '',
      category: '',
      ward: '',
      area: ''
    });
    setSearchQuery('');
    setSortBy('newest');
    setPage(1);
  };

  // Actions
  const handleViewDetails = (id) => {
    navigate(`/waste/complaints/${id}`);
  };

  const handleOpenAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    setIsAssignOpen(true);
  };

  const handleOpenStatusModal = (complaint) => {
    setSelectedComplaint(complaint);
    setIsStatusOpen(true);
  };

  const handleAssignWorkerSubmit = async (workerId, notes) => {
    if (!selectedComplaint) return;
    try {
      await assignWasteComplaintWorker(selectedComplaint.id, workerId, notes);
      toast.success(`Sanitation worker assigned and complaint scheduled.`);
      fetchComplaintsData();
      fetchSummary();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to assign worker.");
    }
  };

  const handleUpdateStatusSubmit = async (status, notes) => {
    if (!selectedComplaint) return;
    try {
      await updateWasteComplaintStatus(selectedComplaint.id, status, notes);
      toast.success(`Complaint status changed to ${status}`);
      fetchComplaintsData();
      fetchSummary();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update status.");
    }
  };

  const handleCloseComplaintDirect = async (id) => {
    toastConfirm("Are you sure you want to close this waste complaint?", async () => {
      try {
        await updateWasteComplaintStatus(id, "CLOSED", "Archived from control panel");
        toast.success("Waste complaint closed successfully.");
        fetchComplaintsData();
        fetchSummary();
      } catch (err) {
        toast.error(err.response?.data?.detail || "Failed to close complaint.");
      }
    });
  };

  const handleDeleteComplaintDirect = async (id) => {
    toastConfirm("Are you sure you want to delete this waste complaint record?", async () => {
      try {
        await deleteWasteComplaint(id);
        toast.success("Waste complaint deleted successfully.");
        fetchComplaintsData();
        fetchSummary();
      } catch (err) {
        toast.error(err.response?.data?.detail || "Failed to delete complaint.");
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader 
        title="Waste Complaint Registry" 
        subtitle="Manage garbage collection issues, overflowing smart bins, and sanitation complaints."
        onActionClick={() => setIsCreateOpen(true)}
        actionLabel="Log New Complaint"
        isLoading={isLoading}
      />

      {/* Top statistics summary blocks */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem'
      }}>
        {[
          { label: "Total Claims Logged", count: stats.total, icon: "assignment", color: "#0284c7", bg: "#f0f9ff" },
          { label: "New Untouched Reports", count: stats.new, icon: "fiber_new", color: "#ea580c", bg: "#fff7ed" },
          { label: "Active Operations Cases", count: stats.active, icon: "pending", color: "#059669", bg: "#ecfdf5" },
          { label: "Completed Operations", count: stats.completed, icon: "check_circle", color: "#16a34a", bg: "#f0fdf4" }
        ].map((card, idx) => (
          <div key={idx} style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                {card.label}
              </span>
              <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
                {card.count}
              </span>
            </div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: card.bg,
              color: card.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search Input */}
      <ComplaintSearch 
        searchQuery={searchQuery}
        setSearchQuery={handleSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Filters and Sorting selector */}
      <ComplaintFilter 
        filters={filters} 
        setFilters={setFilters}
        onReset={handleResetFilters}
      />

      {/* Complaint Listings */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : complaints.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '0.5rem' }}>
            inbox
          </span>
          <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>No Waste Complaints Found</h4>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>No complaints match the selected search queries or category filters.</p>
        </div>
      ) : (
        <>
          <ComplaintTable 
            complaints={complaints}
            totalItems={totalItems}
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
            onAssignWorker={handleOpenAssignModal}
            onUpdateStatus={handleOpenStatusModal}
            onDeleteComplaint={handleDeleteComplaintDirect}
          />
        </>
      )}

      {/* Add complaint modal */}
      <AddComplaintModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          fetchComplaintsData();
          fetchSummary();
        }}
      />

      {/* Assign worker modal */}
      <AssignWorkerModal 
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        onAssign={handleAssignWorkerSubmit}
        complaintNumber={selectedComplaint?.complaint_number}
        complaint={selectedComplaint}
        onSuccess={() => {
          fetchComplaintsData();
          fetchSummary();
        }}
      />

      {/* Status update modal */}
      <StatusUpdateModal 
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        onUpdate={handleUpdateStatusSubmit}
        complaint={selectedComplaint}
        onSuccess={() => {
          fetchComplaintsData();
          fetchSummary();
        }}
      />
    </div>
  );
}
