import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import WorkerProfileCard from '../../components/workers/WorkerProfileCard';
import { getWorkerById } from '../../services/workerService';

export default function WorkerProfile({ department: propDepartment }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const department = propDepartment || (location.pathname.includes('/traffic') ? 'traffic' : location.pathname.includes('/general') ? 'general' : location.pathname.includes('/waste') ? 'waste' : 'water');

  const [worker, setWorker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const response = await getWorkerById(id, department);
        setWorker(response.data);
      } catch (err) {
        toast.error("Failed to load worker profile details.");
        navigate(`/${department}/workers`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorker();
  }, [id, department, navigate]);

  const handleEditClick = (workerId) => {
    navigate(`/${department}/workers/${workerId}/edit`);
  };

  const handleBackClick = () => {
    navigate(`/${department}/workers`);
  };

  return (
    <div className="p-4 md:p-6">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
          <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">sync</span>
          <p className="text-sm font-medium text-slate-500">Retrieving worker profile...</p>
        </div>
      ) : (
        <WorkerProfileCard 
          worker={worker}
          onEditClick={handleEditClick}
          onBackClick={handleBackClick}
        />
      )}
    </div>
  );
}
