import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTrafficWorkers, deleteTrafficWorker, blockTrafficWorker } from '../../features/traffic/trafficThunks';
import TrafficPageHeader from '../../components/traffic/TrafficPageHeader';
import TrafficWorkerTable from '../../components/traffic/TrafficWorkerTable';
import { toastConfirm } from '../../utils/toastConfirm';

const WorkerManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { workers, workersStatus } = useSelector((state) => state.traffic);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchTrafficWorkers({ page: 1, page_size: 10, search: searchTerm }));
  }, [dispatch, searchTerm]);

  const handleDelete = (worker) => {
    toastConfirm(`Are you sure you want to permanently delete ${worker.first_name || worker.username}?`, async () => {
      await dispatch(deleteTrafficWorker(worker.id));
      dispatch(fetchTrafficWorkers({ page: 1, page_size: 10, search: searchTerm }));
    });
  };

  const handleBlock = (worker) => {
    const action = worker.is_active ? 'block/deactivate' : 'unblock/activate';
    toastConfirm(`Are you sure you want to ${action} ${worker.first_name || worker.username}?`, async () => {
      await dispatch(blockTrafficWorker(worker.id));
      dispatch(fetchTrafficWorkers({ page: 1, page_size: 10, search: searchTerm }));
    });
  };

  const handleEdit = (worker) => {
    navigate(`/traffic/workers/${worker.id}/edit`);
  };

  return (
    <div className="p-8 transition-all duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        <TrafficPageHeader 
          title="Field Worker Management" 
          subtitle="Manage your traffic field workers and deployments."
          actionLabel="Add Worker"
          onAction={() => navigate('/traffic/workers/new')}
        />

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4">
          <input 
            type="text" 
            placeholder="Search workers by name or email..." 
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {workersStatus === 'loading' ? (
          <div className="animate-pulse h-64 bg-slate-200 rounded-2xl w-full"></div>
        ) : (
          <TrafficWorkerTable 
            workers={workers.items} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
            onBlock={handleBlock}
          />
        )}
      </div>
    </div>
  );
};

export default WorkerManagement;
