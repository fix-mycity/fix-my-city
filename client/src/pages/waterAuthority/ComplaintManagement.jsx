import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import ComplaintTable from '../../components/waterAuthority/ComplaintTable';
import ComplaintFilter from '../../components/waterAuthority/ComplaintFilter';
import ComplaintSearch from '../../components/waterAuthority/ComplaintSearch';
import PageHeader from '../../components/waterAuthority/PageHeader';
import EmptyState from '../../components/waterAuthority/EmptyState';
import AssignWorkerModal from '../../components/waterAuthority/AssignWorkerModal';
import StatusUpdateModal from '../../components/waterAuthority/StatusUpdateModal';

import { 
  getComplaints, 
  updateComplaintStatus, 
  assignWorker, 
  getDashboardSummary 
} from '../../services/waterComplaintService';

export default function ComplaintManagement() {
  const navigate = useNavigate();
  
  // Complaints and Pagination
  const [complaints, setComplaints] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filter, Search, and Sort state
  const [searchQuery, setSearchQuery] = useState('');
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

  const fetchSummary = async () => {
    try {
      const response = await getDashboardSummary();
      const data = response.data;
      setStats({
        total: data.total_complaints || 0,
        new: data.statuses?.NEW || 0,
        active: (data.total_complaints || 0) - (data.statuses?.CLOSED || 0) - (data.statuses?.REJECTED || 0),
        completed: data.statuses?.COMPLETED || 0
      });
    } catch (err) {
      console.error("Error loading dashboard summary stats", err);
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

      const response = await getComplaints(params);
      setComplaints(response.data.items || []);
      setTotalItems(response.data.total_items || 0);
      setTotalPages(response.data.total_pages || 1);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not retrieve complaints data.");
    } finally {
      setIsLoading(false);
    }
  };

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
    navigate(`/water/complaints/${id}`);
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
      await assignWorker(selectedComplaint.id, workerId, notes);
      toast.success(`Worker assigned and complaint scheduled.`);
      fetchComplaintsData();
      fetchSummary();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to assign worker.");
    }
  };

  const handleUpdateStatusSubmit = async (status, notes) => {
    if (!selectedComplaint) return;
    try {
      await updateComplaintStatus(selectedComplaint.id, status, notes);
      toast.success(`Complaint status changed to ${status}`);
      fetchComplaintsData();
      fetchSummary();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update status.");
    }
  };

  const handleCloseComplaintDirect = async (id) => {
    if (!window.confirm("Are you sure you want to close this complaint?")) return;
    try {
      await updateComplaintStatus(id, "CLOSED", "Archived from control panel");
      toast.success("Complaint closed successfully.");
      fetchComplaintsData();
      fetchSummary();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to close complaint.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader 
        title="Water Complaint Registry" 
        subtitle="Manage municipal leaks, pressure complaints, and water supply issues."
        onActionClick={fetchComplaintsData}
        actionLabel="Refresh List"
        isLoading={isLoading}
      />

      {/* Top statistics summary blocks */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem'
      }}>
        {[
          { label: "Total Claims Logged", count: stats.total, icon: "assignment", color: "blue" },
          { label: "New Untouched Reports", count: stats.new, icon: "fiber_new", color: "orange" },
          { label: "Active Operations Cases", count: stats.active, icon: "pending", color: "indigo" },
          { label: "Completed Operations", count: stats.completed, icon: "check_circle", color: "green" }
        ].map((card, idx) => (
          <div key={idx} style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--water-border)',
            borderRadius: 'var(--water-radius)',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--water-shadow-sm)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--water-text-muted)', textTransform: 'uppercase' }}>
                {card.label}
              </span>
              <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--water-text)' }}>
                {card.count}
              </span>
            </div>
            <div className={`water-card-icon-container ${card.color}`} style={{ position: 'relative', top: 0, right: 0 }}>
              <span className="material-symbols-outlined">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search Input */}
      <ComplaintSearch onSearch={handleSearch} />

      {/* Filters and Sorting selector */}
      <ComplaintFilter 
        filters={filters} 
        onChange={handleFilterChange} 
        onReset={handleResetFilters}
        sorting={sortBy}
        onSortChange={setSortBy}
      />

      {/* Complaint Listings */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <span className="material-symbols-outlined animate-spin" style={{ fontSize: '2.5rem', color: 'var(--water-primary-light)' }}>
            autorenew
          </span>
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState 
          message="No water complaints matches the selected search queries or category filters."
          onReset={handleResetFilters}
        />
      ) : (
        <>
          <ComplaintTable 
            complaints={complaints}
            onViewDetails={handleViewDetails}
            onAssignWorker={handleOpenAssignModal}
            onUpdateStatus={handleOpenStatusModal}
            onCloseComplaint={handleCloseComplaintDirect}
          />

          {/* Simple Pagination Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)' }}>
              Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalItems} total complaints)
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="water-btn"
                style={{ padding: '0.45rem 1rem' }}
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="water-btn"
                style={{ padding: '0.45rem 1rem' }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Assign worker modal */}
      <AssignWorkerModal 
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        onAssign={handleAssignWorkerSubmit}
        complaintNumber={selectedComplaint?.complaint_number}
      />

      {/* Status update modal */}
      <StatusUpdateModal 
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        onUpdate={handleUpdateStatusSubmit}
        complaint={selectedComplaint}
      />
    </div>
  );
}
