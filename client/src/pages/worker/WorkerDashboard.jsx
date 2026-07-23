import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getWorkerTasks } from '../../services/workerTaskService';
import TaskCard from '../../components/worker/TaskCard';

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dashboard counters
  const [stats, setStats] = useState({
    assigned: 0,
    accepted: 0,
    inProgress: 0,
    completed: 0,
    pendingVerify: 0
  });

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await getWorkerTasks({ page_size: 1000 });
      const items = response.data.items || [];
      setTasks(items);

      // Aggregate stats
      const assigned = items.filter(t => t.status === 'ASSIGNED').length;
      const accepted = items.filter(t => t.status === 'ACCEPTED').length;
      const inProgress = items.filter(t => ['TRAVELLING', 'ARRIVED', 'WORK_STARTED', 'ON_HOLD', 'REOPENED'].includes(t.status)).length;
      const completed = items.filter(t => t.status === 'COMPLETED').length;
      const pendingVerify = items.filter(t => t.status === 'COMPLETED').length;

      setStats({ assigned, accepted, inProgress, completed, pendingVerify });
    } catch (err) {
      toast.error("Failed to load worker task board.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const activeTasks = tasks.filter(t => !['VERIFIED', 'REJECTED'].includes(t.status));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--water-text)', margin: 0 }}>
          Field Worker Portal
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)', margin: '0.2rem 0 0' }}>
          Welcome back! Manage your active repair work orders, log progress, and submit completion reports.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span className="material-symbols-outlined">assignment</span>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)', display: 'block', fontWeight: '600' }}>Assigned Tasks</span>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--water-text)' }}>{stats.assigned}</span>
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
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span className="material-symbols-outlined">thumb_up</span>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)', display: 'block', fontWeight: '600' }}>Accepted</span>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--water-text)' }}>{stats.accepted}</span>
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
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: '#fef3c7',
            color: '#b45309',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span className="material-symbols-outlined">engineering</span>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)', display: 'block', fontWeight: '600' }}>In Progress</span>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--water-text)' }}>{stats.inProgress}</span>
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
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: '#dcfce7',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)', display: 'block', fontWeight: '600' }}>Completed</span>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--water-text)' }}>{stats.completed}</span>
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
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: '#f3e8ff',
            color: '#7e22ce',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span className="material-symbols-outlined">rate_review</span>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)', display: 'block', fontWeight: '600' }}>Pending Verify</span>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--water-text)' }}>{stats.pendingVerify}</span>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left column: active task list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--water-text)', margin: 0 }}>
              Your Active Tasks
            </h3>
            <button
              onClick={() => navigate('/worker/tasks')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--water-primary-light)',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              See All Assigned Tasks
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '20vh' }}>
              <span className="material-symbols-outlined animate-spin" style={{ color: 'var(--water-primary-light)' }}>
                sync
              </span>
            </div>
          ) : activeTasks.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--water-border)', color: 'var(--water-text-muted)' }}>
              No current active repairs. Enjoy your day!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {activeTasks.map((t) => (
                <TaskCard key={t.id} task={t} />
              ))}
            </div>
          )}
        </div>

        {/* Right column: Quick shortcuts */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--water-border)',
          borderRadius: '16px',
          padding: '1.25rem',
          boxShadow: 'var(--water-shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-text)' }}>
            Quick Shortcuts
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => navigate('/worker/tasks')}
              className="water-btn"
              style={{
                width: '100%',
                padding: '0.6rem',
                fontSize: '0.82rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                justifyContent: 'flex-start'
              }}
            >
              <span className="material-symbols-outlined">list_alt</span>
              My Task Board
            </button>
            <button
              onClick={() => navigate('/worker/history')}
              className="water-btn"
              style={{
                width: '100%',
                padding: '0.6rem',
                fontSize: '0.82rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                justifyContent: 'flex-start'
              }}
            >
              <span className="material-symbols-outlined">history</span>
              Completed History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
