import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import TaskTable from '../../components/waterAuthority/TaskTable';
import { getMaintenanceTasks, createMaintenanceTask, updateMaintenanceTask } from '../../services/maintenanceTaskService';
import { getWorkers } from '../../services/workerService';

export default function MaintenanceTasks() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [workerId, setWorkerId] = useState('');

  const fetchTasksAndWorkers = async () => {
    try {
      const taskRes = await getMaintenanceTasks(id);
      setTasks(taskRes.data);

      const workerRes = await getWorkers();
      setWorkers(workerRes.data.workers || []);
    } catch (e) {
      toast.error("Failed to load tasks or workers directory.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchTasksAndWorkers();
  }, [id]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskName.trim()) {
      alert("Task name is required.");
      return;
    }

    try {
      await createMaintenanceTask(id, {
        task_name: taskName,
        task_description: description || null,
        worker_id: workerId ? parseInt(workerId) : null,
        status: 'PENDING'
      });
      toast.success("Task created successfully!");
      setTaskName('');
      setDescription('');
      setWorkerId('');
      fetchTasksAndWorkers();
    } catch (err) {
      toast.error("Failed to create task.");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateMaintenanceTask(taskId, { status: newStatus });
      toast.success("Task status updated.");
      fetchTasksAndWorkers();
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button 
          onClick={() => navigate(`/water/maintenance/${id}`)}
          className="water-btn-icon" 
          title="Back to Details"
          style={{ border: '1px solid var(--water-border)', width: '36px', height: '36px', borderRadius: '8px' }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--water-text)', margin: 0 }}>
            Manage Micro-Tasks
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--water-text-muted)' }}>
            Break down maintenance requests into assigned tasks for specific workers.
          </span>
        </div>
      </div>

      {/* Grid: task creation and list */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* Task Form */}
        <form onSubmit={handleAddTask} className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
            Add Micro-Task
          </h3>

          <div>
            <label className="water-label">Task Name *</label>
            <input 
              type="text" 
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Cut and weld pipeline seam"
              required
              className="water-input"
            />
          </div>

          <div>
            <label className="water-label">Task Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Micro-task specifications..."
              className="water-input"
              style={{ height: '60px', fontFamily: 'inherit' }}
            />
          </div>

          <div>
            <label className="water-label">Assign Field Worker</label>
            <select 
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              className="water-input"
            >
              <option value="">Choose worker...</option>
              {workers.map(w => (
                <option key={w.id} value={w.id}>{w.first_name} {w.last_name} ({w.skill || 'Worker'})</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            className="water-btn"
            style={{ backgroundColor: 'var(--water-primary)', color: '#ffffff', border: 'none', fontWeight: '700', marginTop: '0.5rem' }}
          >
            Create Task
          </button>
        </form>

        {/* Task list table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--water-primary)', margin: 0 }}>
            Task Progress Logs
          </h3>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '2rem', color: 'var(--water-primary-light)' }}>
                autorenew
              </span>
            </div>
          ) : (
            <TaskTable 
              tasks={tasks}
              workers={workers}
              onUpdateStatus={handleStatusChange}
            />
          )}
        </div>
      </div>

    </div>
  );
}
