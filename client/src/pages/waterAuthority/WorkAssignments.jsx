import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getAssignments } from '../../services/assignmentService';
import { getComplaints } from '../../services/waterComplaintService';
import { getWorkers } from '../../services/workerService';
import AssignmentTable from '../../components/waterAuthority/AssignmentTable';
import AssignmentFilter from '../../components/waterAuthority/AssignmentFilter';

export default function WorkAssignments() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [assignments, setAssignments] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: '',
    priority: ''
  });

  // Metrics State
  const [metrics, setMetrics] = useState({
    pendingAssignment: 0,
    assignedToday: 0,
    completedToday: 0,
    verificationPending: 0,
    availableWorkers: 0,
    totalWorkers: 0
  });

  // Fetch Stats Metrics
  const fetchMetrics = async () => {
    try {
      // 1. Fetch ACCEPTED complaints needing assignment
      const compRes = await getComplaints({ status: 'ACCEPTED', page_size: 1000 });
      const pendingCount = (compRes.data.items || []).length;

      // 2. Fetch all assignments to calculate today's records
      const assignRes = await getAssignments({ page_size: 1000 });
      const allAssigns = assignRes.data.items || [];
      
      const todayStr = new Date().toDateString();
      const assignedToday = allAssigns.filter(
        a => new Date(a.assigned_date).toDateString() === todayStr
      ).length;

      const completedToday = allAssigns.filter(
        a => a.status === 'COMPLETED' && new Date(a.updated_at).toDateString() === todayStr
      ).length;

      const verificationPending = allAssigns.filter(
        a => a.status === 'COMPLETED'
      ).length;

      // 3. Fetch workers to check availability
      const workerRes = await getWorkers({ page_size: 1000 });
      const allWorkers = workerRes.data.items || [];
      const totalWorkers = allWorkers.length;
      const availableWorkers = allWorkers.filter(w => w.availability === 'AVAILABLE' && w.employment_status === 'ACTIVE').length;

      setMetrics({
        pendingAssignment: pendingCount,
        assignedToday,
        completedToday,
        verificationPending,
        availableWorkers,
        totalWorkers
      });
    } catch (err) {
      console.error("Failed to load metrics:", err);
    }
  };

  const fetchAssignmentsList = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
        search: filters.search || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined
      };
      const response = await getAssignments(params);
      setAssignments(response.data.items || []);
      setTotalItems(response.data.total_items || 0);
    } catch (err) {
      toast.error("Failed to retrieve work assignments registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilters(prev => ({ ...prev, search: searchParams.get('search') || '' }));
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    fetchAssignmentsList();
  }, [page, filters]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // reset to page 1 on filter
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: ''
    });
    setPage(1);
  };

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--water-text)', margin: 0 }}>
            Work Assignments
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)', margin: '0.2rem 0 0' }}>
            Assign, schedule, and track field repairs for reported pipeline leaks and complaints.
          </p>
        </div>
        <button
          onClick={() => navigate('/water/assignments/history')}
          className="water-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            borderColor: 'var(--water-primary-light)',
            color: 'var(--water-primary-light)',
            fontWeight: '700'
          }}
        >
          <span className="material-symbols-outlined">history</span>
          Timeline Audit Log
        </button>
      </div>

      {/* Metrics Dashboard Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        {/* Metric 1 */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem',
          border: '1px solid var(--water-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: 'var(--water-shadow-sm)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#ffedd5',
            color: '#ea580c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.8rem' }}>pending_actions</span>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--water-text-muted)', display: 'block', fontWeight: '600' }}>Pending Assignment</span>
            <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--water-text)' }}>{metrics.pendingAssignment}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem',
          border: '1px solid var(--water-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: 'var(--water-shadow-sm)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.8rem' }}>assignment_ind</span>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--water-text-muted)', display: 'block', fontWeight: '600' }}>Assigned Today</span>
            <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--water-text)' }}>{metrics.assignedToday}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem',
          border: '1px solid var(--water-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: 'var(--water-shadow-sm)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#dcfce7',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.8rem' }}>task_alt</span>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--water-text-muted)', display: 'block', fontWeight: '600' }}>Completed Today</span>
            <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--water-text)' }}>{metrics.completedToday}</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem',
          border: '1px solid var(--water-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: 'var(--water-shadow-sm)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#f3e8ff',
            color: '#7e22ce',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.8rem' }}>rate_review</span>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--water-text-muted)', display: 'block', fontWeight: '600' }}>Verification Pending</span>
            <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--water-text)' }}>{metrics.verificationPending}</span>
          </div>
        </div>

        {/* Metric 5 */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem',
          border: '1px solid var(--water-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: 'var(--water-shadow-sm)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#e2e8f0',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.8rem' }}>groups</span>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--water-text-muted)', display: 'block', fontWeight: '600' }}>Worker Availability</span>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--water-text)' }}>
              {metrics.availableWorkers} <span style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)', fontWeight: '500' }}>/ {metrics.totalWorkers} Avail</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <AssignmentFilter filters={filters} onChange={handleFilterChange} onClear={handleClearFilters} />

      {/* Main Table section */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh', backgroundColor: '#ffffff', border: '1px solid var(--water-border)', borderRadius: '12px' }}>
          <span className="material-symbols-outlined animate-spin" style={{ fontSize: '2.5rem', color: 'var(--water-primary-light)' }}>
            sync
          </span>
        </div>
      ) : (
        <>
          <AssignmentTable assignments={assignments} />

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--water-text-muted)' }}>
                Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> (Total <strong>{totalItems}</strong> assignments)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="water-btn"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  Previous
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="water-btn"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
