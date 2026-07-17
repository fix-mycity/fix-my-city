import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateTrafficWorker } from '../../features/traffic/trafficThunks';
import TrafficWorkerForm from '../../components/traffic/TrafficWorkerForm';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function EditTrafficWorker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { workers } = useSelector(state => state.traffic);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [worker, setWorker] = useState(null);

  useEffect(() => {
    if (id && workers?.items) {
      const foundWorker = workers.items.find(w => w.id === parseInt(id));
      if (foundWorker) {
        setWorker(foundWorker);
      } else {
        toast.error("Worker not found.");
        navigate('/traffic/workers');
      }
    }
  }, [id, workers, navigate]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await dispatch(updateTrafficWorker({ workerId: worker.id, workerData: formData })).unwrap();
      toast.success("Worker profile updated successfully!");
      navigate('/traffic/workers');
    } catch (err) {
      toast.error(err?.message || "Failed to update worker.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/traffic/workers');
  };

  if (!worker) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 transition-all duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {isSubmitting ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-slate-800">Updating Worker Profile...</h3>
            <p className="text-slate-500 font-medium">Saving changes to the database...</p>
          </div>
        ) : (
          <TrafficWorkerForm 
            initialData={worker}
            onSubmit={handleSubmit} 
            onCancel={handleCancel} 
          />
        )}
        
      </div>
    </div>
  );
}
