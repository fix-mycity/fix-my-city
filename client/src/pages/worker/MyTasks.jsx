import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getWorkerTasks } from '../../services/workerTaskService';
import TaskTable from '../../components/worker/TaskTable';

export default function MyTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchTasksList = async () => {
    setLoading(true);
    try {
      const params = {
        status: statusFilter || undefined,
        priority: priorityFilter || undefined
      };
      const response = await getWorkerTasks(params);
      setTasks(response.data.items || []);
    } catch (err) {
      toast.error("Failed to retrieve assigned tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksList();
  }, [statusFilter, priorityFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--water-text)', margin: 0 }}>
            My Task Board
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)', margin: '0.2rem 0 0' }}>
            List of leak repairs and emergency maintenance tasks assigned to you.
          </p>
        </div>
        <button
          onClick={() => navigate('/worker/history')}
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
          Completed Task History
        </button>
      </div>

      {/* Quick Filters Row */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--water-border)',
        borderRadius: '12px',
        padding: '1rem',
        boxShadow: 'var(--water-shadow-sm)',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Status Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '160px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--water-text)' }}>Status Filter</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid var(--water-border)',
              fontSize: '0.8rem',
              outline: 'none',
              backgroundColor: '#ffffff'
            }}
          >
            <option value="">All Statuses</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="TRAVELLING">Travelling</option>
            <option value="ARRIVED">Arrived</option>
            <option value="WORK_STARTED">Started</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="VERIFIED">Verified</option>
            <option value="REOPENED">Reopened</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '160px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--water-text)' }}>Priority Filter</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid var(--water-border)',
              fontSize: '0.8rem',
              outline: 'none',
              backgroundColor: '#ffffff'
            }}
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        {/* Clear Button */}
        {(statusFilter || priorityFilter) && (
          <button
            onClick={() => {
              setStatusFilter('');
              setPriorityFilter('');
            }}
            className="water-btn"
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', marginTop: '1.25rem' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Table section */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--water-border)' }}>
          <span className="material-symbols-outlined animate-spin" style={{ fontSize: '2.5rem', color: 'var(--water-primary-light)' }}>
            sync
          </span>
        </div>
      ) : (
        <TaskTable tasks={tasks} />
      )}
    </div>
  );
}
