import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import TankForm from '../../components/waterAuthority/TankForm';
import { createTank } from '../../services/waterTankService';

export default function AddTank() {
  const navigate = useNavigate();

  const handleSubmit = async (payload) => {
    try {
      await createTank(payload);
      toast.success("Water tank registered successfully!");
      navigate('/water/tanks');
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to register tank.");
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <TankForm 
        onSubmit={handleSubmit}
        onCancel={() => navigate('/water/tanks')}
      />
    </div>
  );
}
