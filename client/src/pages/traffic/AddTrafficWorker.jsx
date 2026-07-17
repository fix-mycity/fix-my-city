import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createTrafficWorker } from '../../features/traffic/trafficThunks';
import TrafficWorkerForm from '../../components/traffic/TrafficWorkerForm';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function AddTrafficWorker() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await dispatch(createTrafficWorker(formData)).unwrap();
      toast.success("Field worker registered successfully!");
      navigate('/traffic/workers');
    } catch (err) {
      toast.error(err?.message || "Failed to register field worker.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/traffic/workers');
  };

  return (
    <div className="p-8 transition-all duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {isSubmitting ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-slate-800">Registering Worker...</h3>
            <p className="text-slate-500 font-medium">Encrypting credentials and provisioning access...</p>
          </div>
        ) : (
          <TrafficWorkerForm 
            onSubmit={handleSubmit} 
            onCancel={handleCancel} 
          />
        )}
        
      </div>
    </div>
  );
}
